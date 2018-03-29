#!/usr/bin/env python
from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, Blueprint, Response
import os
import datetime
import commands
import folders

def Commit(path, message):
    now = datetime.datetime.now()
    now_str = now.strftime('%Y%m%d%H%M%S')
    queue_commit_path = '%s/commits' % path
    if not os.path.exists(queue_commit_path):
        os.mkdir(queue_commit_path)
        os.chmod(queue_commit_path, 0777)

    commit_script = '%s/%s.sh' % (queue_commit_path, now_str)
    commit_log = commit_script.replace('.sh', '.log')
    login_param = "-login:Administrator,\\!1mpa1a\\#16"
    fh = open(commit_script, 'w')
    fh.write('#!/bin/bash\n\n')
    fh.write('cd %s/\n' % path)
    fh.write('date >> %s\n' % commit_log)
    fh.write('/home/gbrewer/bin/TEE-CLC-14.114.0/tf add * -recursive %s &>> %s\n' % (login_param, commit_log))
    fh.write('/home/gbrewer/bin/TEE-CLC-14.114.0/tf commit -comment:"%s" %s &>> %s\n' % (message, login_param, commit_log))
    fh.write('date >> %s\n' % commit_log)
    fh.close()
    os.chmod(commit_script, 0777)
    status, resp = commands.getstatusoutput('/appl/progs/qr %s i' % commit_script)
    if status != 0:
        return False, 'Script %s failed to queue with response %s' % (commit_script, resp)

    folder_html = "";
    if 'root_folder' in session and session['root_folder'] not in (None, 'None', ''):
        folder_html = folders.DrawFolderTree(session['root_folder'])
    return True, {'message': 'Script %s queued with QID %s' % (commit_script, resp), 'folders': folder_html}