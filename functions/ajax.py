#!/usr/bin/env python
import re
import unidecode
import datetime
import json
from flask import redirect, url_for, g, request, flash
from flask_login import current_user
import core
import folders
import tfs

def Request(action, method, response_type):
    global request
    request_object = BuildRequestObject(action, method, response_type)
    status, status_type, results = ProcessRequest(action, method, request_object)
    return status, status_type, request_object, results

def BuildRequestObject(action, method, response_type):
    req = {}
    req['action'] = action
    req['method'] = method
    req['response_type'] = response_type
    for key,value in request.form.items():
        if '[]' in key:
            req[key] = request.form.getlist(key)
        else:
            req[key] = request.form[key]
    return req

def ProcessRequest(action, method, request_object):
    status_type = "OK"
    if action == 'tfs':
        if method == 'commit':
            if 'path' not in request_object:
                return False, "Error", [{'Message': 'path not specified'}]
            path = request_object['path']
            if 'message' not in request_object:
                return False, "Error", [{'Message': 'message not specified'}]
            message = request_object['message']
            status, results = tfs.Commit(path, message)
            if not status:
                return False, "Error", [{'Message': results}]
        else:
            status = False
            status_type = "Error"
            results = [{'Message': 'Method "%s" for action "%s" not defined' % (method, action)}]
    elif action == 'folder':
        if method == 'get':
            if 'path' not in request_object:
                return False, "Error", [{'Message': 'path not specified'}]
            path = request_object['path']
            status, results = folders.GetFolderItems(path)
            if not status:
                return False, "Error", [{'Message': results}]
            status_type = "OK"
        elif method == 'new':
            if 'current_folder' not in request_object:
                return False, "Error", [{'Message': 'current_folder not specified'}]
            current_folder = request_object['current_folder']
            if 'root_folder' not in request_object:
                return False, "Error", [{'Message': 'root_folder not specified'}]
            root_folder = request_object['root_folder']
            if 'name' not in request_object:
                return False, "Error", [{'Message': 'name not specified'}]
            name = request_object['name']
            go_to_item = False
            if 'go_to_item' in request_object and request_object['go_to_item'] in ('true', True, 'True', 1, '1'):
                go_to_item = True

            status, new_path, folder_html = folders.CreateFolder(current_folder, name, root_folder)
            if not status:
                return False, "Error", [{'Message': new_path}]
            results = {'go_to_item': go_to_item, 'item_type': 'folder', 'file_editable': False, 'root_folder': root_folder}
            if go_to_item:
                results['path'] = new_path
            else:
                results['path'] = current_folder
            results['folder_html'] = folder_html
        else:
            status = False
            status_type = "Error"
            results = [{'Message': 'Method "%s" for action "%s" not defined' % (method, action)}]
    elif action == 'file':
        if method == 'new':
            if 'current_folder' not in request_object:
                return False, "Error", [{'Message': 'current_folder not specified'}]
            current_folder = request_object['current_folder']
            if 'root_folder' not in request_object:
                return False, "Error", [{'Message': 'root_folder not specified'}]
            root_folder = request_object['root_folder']
            if 'name' not in request_object:
                return False, "Error", [{'Message': 'name not specified'}]
            name = request_object['name']
            go_to_item = False
            if 'go_to_item' in request_object and request_object['go_to_item'] in ('true', True, 'True', 1, '1'):
                go_to_item = True

            status, response = folders.CreateFile(current_folder, name)
            if not status:
                return False, "Error", [{'Message': response}]
            results = {'go_to_item': go_to_item, 'item_type': 'file', 'file_editable': response['editable'], 'file_viewable': response['viewable'], 'root_folder': root_folder, 'path': response['new_path']}
        elif method in ('copy', 'move-file', 'move', 'extract'):
            if 'current_folder' not in request_object:
                return False, "Error", [{'Message': 'current_folder not specified'}]
            current_folder = request_object['current_folder']
            if 'dest_path' not in request_object:
                return False, "Error", [{'Message': 'dest_path not specified'}]
            dest_path = request_object['dest_path']
            if method == 'extract':
                if 'file' not in request_object:
                    return False, "Error", [{'Message': 'file not specified'}]
                file = request_object['file']
                id, file = file.split('|', 1)
            else:
                if 'files[]' not in request_object:
                    return False, "Error", [{'Message': 'files not specified'}]
                files = request_object['files[]']
                for idx in range(0, len(files)):
                    files[idx] = files[idx].split('|', 1)[1]
            overwrite = False
            if 'overwrite' in request_object and request_object['overwrite'] in ('true', True, 'True', 1, '1'):
                overwrite = True
            

            if method == 'copy':
                status, response = folders.CopyFile(files[0], dest_path, overwrite)
            elif method.startswith('move'):
                status, response = folders.MoveFiles(files, dest_path, overwrite)
            elif method == 'extract':
                go_to_item = False
                if 'go_to_item' in request_object and request_object['go_to_item'] in ('true', True, 'True', 1, '1'):
                    go_to_item = True
                status, response = folders.ExtractArchive(file, dest_path, current_folder, overwrite, go_to_item)
            if not status:
                return False, "Error", [{'Message': response}]
            elif method == 'extract':
                results = response
            else:
                results = {'path': dest_path, 'files': files, 'response': response}
        elif method == 'delete':
            if 'files[]' not in request_object:
                return False, "Error", [{'Message': 'files not specified'}]
            files = request_object['files[]']
            status, response = folders.DeleteFiles(files)
            if not status:
                return False, "Error", [{'Message': response}]
            results = response
        elif method == 'properties':
            if 'file' not in request_object:
                return False, "Error", [{'Message': 'file not specified'}]
            file = request_object['file']
            id, file = file.split('|', 1)
            status, results = folders.FileProperties(file)
            if not status:
                return False, "Error", [{'Message': results}]
            #print results
        elif method == 'rename':
            if 'dest_path' not in request_object:
                return False, "Error", [{'Message': 'dest_path not specified'}]
            dest_path = request_object['dest_path']
            if 'file' not in request_object:
                return False, "Error", [{'Message': 'file not specified'}]
            file = request_object['file']
            if 'new_name' not in request_object:
                return False, "Error", [{'Message': 'new_name not specified'}]
            new_name = request_object['new_name']
            status, results = folders.RenameFile(dest_path, file, new_name)
            if not status:
                return False, "Error", [{'Message': results}]
            results = {'path': dest_path, 'file': new_name}
        elif method == 'compress':
            if 'dest_path' not in request_object:
                return False, "Error", [{'Message': 'dest_path not specified'}]
            dest_path = request_object['dest_path']
            if 'files[]' not in request_object:
                return False, "Error", [{'Message': 'files not specified'}]
            files = request_object['files[]']
            if 'name' not in request_object:
                return False, "Error", [{'Message': 'name not specified'}]
            name = request_object['name']
            if 'type' not in request_object:
                return False, "Error", [{'Message': 'type not specified'}]
            type = request_object['type']
            overwrite = False
            if 'overwrite' in request_object and request_object['overwrite'] in ('true', True, 'True', 1, '1'):
                overwrite = True
            status, results = folders.CreateArchive(dest_path, name, type, files, overwrite)
            if not status:
                return False, "Error", [{'Message': results}]
        elif method == 'save':
            if 'file' not in request_object:
                return False, "Error", [{'Message': 'file not specified'}]
            file = request_object['file']
            close_after = False
            if 'close_after' in request_object and request_object['close_after'] in ('true', True, 'True', 1, '1'):
                close_after = True
            if 'content' not in request_object:
                return False, "Error", [{'Message': 'content not specified'}]
            content = request_object['content']
            status, response = folders.SaveContent(file, content)
            if not status:
                return False, "Error", [{'Message': response}]
            results = {'close_after': close_after, 'response': response}
        else:
            status = False
            status_type = "Error"
            results = [{'Message': 'Method "%s" for action "%s" not defined' % (method, action)}]
    else:
        status = False
        status_type = "Error"
        results = [{'Message': 'Action "%s" not defined' % (action)}]

    return status, status_type, results