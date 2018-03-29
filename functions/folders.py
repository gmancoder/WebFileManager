#!/usr/bin/env python
from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, Blueprint, Response
import glob
import os
import mimetypes
import datetime
import hurry.filesize
import core
import config
import shutil
import pwd
import grp
import socket

def TFSEnabled(path):
    return os.path.exists('%s/.tfs' % path) and 'SIERRA' in socket.gethostname()

def AppendBackslash(path):
    if not path.endswith('/'):
        path = '%s/' % path
    return path

def Editable(ext):
    return ext in config.GetConfigSetting("EDITABLE_EXTENSIONS")

def Viewable(ext):
    return ext != ''

def Extractable(ext, name):
    return ext in ('rar', 'zip', 'tar') or name.endswith('tar.gz')

def GetFolderItems(path):
    session['current_folder'] = path
    g.current_folder = path
    if TFSEnabled(path):
        session['tfs'] = True
        g.tfs = True
    else:
        session['tfs'] = False
        g.tfs = False
    items = []
    idx = 0
    files = sorted(glob.glob('%s/*' % path))
    for file in files:
        idx += 1
        #try:
        item = GetItem(file, idx)
        items.append(item)
        #except Exception as ex:
        #    return False, str(ex)
    return True, {'items': items, 'tfs': g.tfs}

def GetItem(file, idx):
    file_spl = file.split('/')
    item = {'id': idx, 'name': file_spl[-1], 'path': file, 'edit': False, 'view': False, 'download': False, 'extract': False, 'copy': False, 'move': False}
    ext = ''
    if os.path.isdir(file):
        item['icon'] = 'folder.png'
    else:
        item['copy'] = True
        item['move'] = True
        item['download'] = True
        name_spl = file_spl[-1].split('.')
        ext = name_spl[-1].lower()
        icon = '%s-icon-24x24.png' % ext
        icon_path = '%s/static/img/doc_icons/%s' % (core.root(), icon)
        print icon_path
        if os.path.exists(icon_path):
            item['icon'] = icon
        else:
            item['icon'] = icon.replace(ext, 'txt')
    st = os.stat(file)
    size = st.st_size
    try:
        item['uid'] = pwd.getpwuid(st.st_uid)[0]
    except:
        item['uid'] = st.st_uid
    try:
        item['gid'] = grp.getgrgid(st.st_gid)[0]
    except:
        item['gid'] = st.st_gid
    item['size'] = hurry.filesize.size(size, system=hurry.filesize.alternative)
    mtime = datetime.datetime.fromtimestamp(st.st_mtime)
    atime = datetime.datetime.fromtimestamp(st.st_atime)
    ctime = datetime.datetime.fromtimestamp(st.st_ctime)
    
    item['mtime'] = mtime.strftime('%Y-%m-%d %H:%M:%S')
    item['atime'] = atime.strftime('%Y-%m-%d %H:%M:%S')
    item['ctime'] = ctime.strftime('%Y-%m-%d %H:%M:%S')
    item['mime'] = mimetypes.guess_type(file)[0]
    if item['mime'] == None:
        item['mime'] = ext

    if Editable(ext):
        item['edit'] = True
    if Extractable(ext, file_spl[-1]):
        item['extract'] = True
    if Viewable(ext):
        item['view'] = True
    return item

def DrawFolderTree(path):
    items = sorted(glob.glob('%s/*' % path))
    children = "<ul>"
    for item in items:
        if os.path.isdir(item):
            item_spl = item.split('/')
            folder = "<li><a href='%s'>%s</a>" % (item, item_spl[-1])
            folder = '%s%s' % (folder, DrawFolderTree(item))
            folder = '%s</li>' % folder
            children = '%s%s' % (children, folder)
    children = '%s</ul>' % children
    #print children
    return children

def CreateFolder(path, name, root):
    try:
        path = AppendBackslash(path)
        full_path = '%s%s' % (path, name)
        os.mkdir(full_path)
        os.chmod(full_path, 0777)

        return True, full_path, DrawFolderTree(root)
    except Exception as ex:
        return False, str(ex), DrawFolderTree(root)

def CreateFile(path, name):
    try:
        path = AppendBackslash(path)
        full_path = '%s%s' % (path, name)
        fh = open(full_path, 'w')
        fh.write("\n")
        fh.close()
        name_spl = name.split('.')
        ext = name_spl[-1]
        response = {'new_path': full_path, 'editable': Editable(ext), 'viewable': Viewable(ext)}
        return True, response
    except Exception as ex:
        return False, str(ex)

def CopyFile(src, dest, overwrite):
    try:
        s_path, s_file = os.path.split(src)
        dest_path = '%s/%s' % (dest, s_file)
        if not os.path.exists(dest_path) or overwrite:
            shutil.copy(src, dest_path)
            return True, "OK"
        else:
            return False, "File %s already exists, check the overwrite checkbox to overwrite" % dest_path
    except Exception as ex:
        return False, str(ex)

def MoveFiles(src_files, dest, overwrite):
    moved = 0
    errors = []
    try:
        for src in src_files:
            s_path, s_file = os.path.split(src)
            dest_path = '%s/%s' % (dest, s_file)
            if not os.path.exists(dest_path) or overwrite:
                shutil.move(src, dest_path)
                moved += 1
            else:
                errors.append("File %s already exists, check the overwrite checkbox to overwrite" % dest_path)
        if moved == 0:
            return False, '\n'.join(errors)
        return True, {'Moved': moved, 'Errors': errors}
    except Exception as ex:
        return False, str(ex)
def DeleteFiles(files):
    try:
        for file in files:
            id, filename = file.split('|', 1)
            if os.path.isdir(filename):
                shutil.rmtree(filename)
            else:
                os.remove(filename)
        folders = "";
        if 'root_folder' in session and session['root_folder'] not in (None, 'None', ''):
            folders = DrawFolderTree(session['root_folder'])
        return True, {'status': "OK", 'folders': folders}
    except Exception as ex:
        return False, str(ex)

def FileProperties(file):
    return True, GetItem(file, 1)

def RenameFile(dest, file, name):
    try:
        id, file = file.split('|', 1)
        new_path = '%s/%s' % (dest, name)
        if not os.path.exists(new_path):
            shutil.move(file, new_path)
            return True, "OK"
        else:
            return False, "File %s exists" % new_path
    except Exception as ex:
        return False, str(ex)

def CreateArchive(dest, name, type, files, overwrite=False):
    try:
        archive_file = '%s/%s' % (dest, name)
        if not archive_file.endswith(type):
            archive_file = '%s.%s' % (archive_file, type)
        if not os.path.exists(archive_file) or overwrite:
            if type == 'tar.gz':
                import tarfile
                tar = tarfile.open(archive_file, 'w:gz')
                for file in files:
                    id, file = file.split('|',1)
                    if os.path.isdir(file):
                        file_list = get_file_list(file, [])
                        for f in file_list:
                            archname = f.replace('%s/' % dest, '')
                            tar.add(f, arcname=archname)
                    else:
                        archname = file.replace('%s/' % dest, '')
                        tar.add(file, arcname=archname)
                tar.close()
            elif type == 'zip':
                import zipfile
                zip = zipfile.ZipFile(archive_file, 'w')
                for file in files:
                    id, file = file.split('|',1)
                    if os.path.isdir(file):
                        file_list = get_file_list(file, [])
                        for f in file_list:
                            archname = f.replace('%s/' % dest, '')
                            zip.write(f, arcname=archname)
                    else:
                        archname = file.replace('%s/' % dest, '')
                        zip.write(file, arcname=archname)
                zip.close()
            elif type == 'rar':
                from librar import archive
                base = dest
                rar = archive.Archive(archive_file,base)
                rar.set_exclude_base_dir(True)
                for file in files:
                    id, file = file.split('|',1)
                    if os.path.isdir(file):
                        rar.add_dir(file)
                    else:
                        rar.add_file(file)
                rar.run()
            return True, {'path': dest, 'file': archive_file}
        else:
            return False, "File %s already exists" % archive_file
    except Exception as ex:
        return False, str(ex)

def get_file_list(path, file_list):
    if not path.endswith('/'):
        path = '%s/' % path
    files = glob.glob('%s*' % path)
    for f in files:
        if os.path.isdir(f):
            file_list = get_file_list(f, file_list)
        else:
            file_list.append(f)
    return file_list

def _extract_members(archive, dest, members, overwrite):
    errors = []
    extracted = 0
    for member in members:
        path, filename = os.path.split(member)
        new_path = '%s/%s' % (dest, path)
        if not os.path.exists(new_path):
            os.makedirs(new_path)
        check_path = '%s/%s' % (dest, member)
        if not os.path.exists(check_path) or overwrite:
            archive.extract(member, dest)
            extracted += 1
        else:
            errors.append(check_path)
    return errors, extracted

def ExtractArchive(archive, dest, current_folder, overwrite, go_to_folder):
    response = {'path': current_folder}
    try:
        if archive.endswith('.rar'):
            from unrar import rarfile
            rar = rarfile.RarFile(archive)
            members = rar.namelist()
            errors, extracted = _extract_members(rar, dest, members, overwrite)
        elif archive.endswith('.zip'):
            import zipfile
            zip = zipfile.ZipFile(archive, 'r')
            members = zip.namelist()
            errors, extracted = _extract_members(zip, dest, members, overwrite)
        elif archive.endswith('.tar.gz'):
            import tarfile
            tar = tarfile.open(archive, 'r:gz')
            members = tar.getnames()
            errors, extracted = _extract_members(tar, dest, members, overwrite)
        else:
            return False, "File %s not an archive" % archive
        if go_to_folder:
            response['path'] = dest
        folders = "";
        if 'root_folder' in session and session['root_folder'] not in (None, 'None', ''):
            folders = DrawFolderTree(session['root_folder'])
        response['folders'] = folders
        response['errors'] = errors
        response['extracted'] = extracted
        return True, response
    except Exception as ex:
        return False, str(ex)

def SaveContent(file, content):
    try:
        fh = open(file, 'w')
        fh.write(content)
        fh.close()
        return True, "OK"
    except Exception as ex:
        return False, str(ex)