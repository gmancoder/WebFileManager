#!/usr/bin/env python

from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, Blueprint, Response, send_from_directory
from flask_login import LoginManager,login_user , logout_user , current_user , login_required
from models.shared import login_manager
import functions.users as users
import functions.core as core
import functions.ajax as ajax
import functions.folders as folders
import functions.config as config
import urllib2
import re
import glob
import os
import socket
from functools import wraps
from werkzeug.utils import secure_filename

main = Blueprint("main", __name__)

@login_manager.user_loader
def load_user(id):
    return users.GetUserByID(id)

@main.before_request
def before_request():
    g.user = current_user._get_current_object()
    core.Init()

@main.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    username = request.form['username']
    password = request.form['password']
    if _check_login(username, password):
        flash('Logged in successfully', 'info')
        return redirect(request.args.get('next') or url_for('main.index'))
    else:
        flash('Username or Password is invalid' , 'danger')
        return redirect(url_for('main.login'))

def _check_login(username, password):
    registered_user = users.CheckLogin(username, password)
    #print registered_user.id
    if registered_user is None:
        return False
    return login_user(registered_user)

def authenticate():
    """Sends a 401 response that enables basic auth"""
    return Response(
    'Could not verify your access level for that URL.\n'
    'You have to login with proper credentials', 401,
    {'WWW-Authenticate': 'Basic realm="Login Required"'})

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not _check_login(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

@main.route('/logout')
def logout():
    session['root_folder'] = None
    logout_user()
    return redirect(url_for('main.index'))

@main.route("/", methods=["GET", "POST"])
@login_required
def index():
    if request.method == "POST":
        root_folder = request.form['root_folder']
        session['root_folder'] = root_folder
        session['tfs'] = folders.TFSEnabled(root_folder)
        core.Init()

    page = "index"
    shortcuts = []
    if 'root_folder' in session and session['root_folder'] not in (None, 'None', ''):
        page = "manager"
        items = folders.DrawFolderTree(g.root_folder)
    else:
        shortcuts = config.GetConfigSetting("SHORTCUTS")
        items = core.GetProjects()
    return render_template("%s.html" % page, title='File Manager', items=items, shortcuts=shortcuts, host=socket.gethostname())

@main.route('/change_folder')
@login_required
def change_folder():
    session['root_folder'] = None
    session['current_folder'] = None
    return redirect(url_for('main.index'))

@main.route("/api/<string:action>/<string:method>", methods=['GET', 'POST'])
@main.route("/api/<string:action>/<string:method>.<string:return_type>", methods=['GET', 'POST'])
@requires_auth
def api_helper(action, method, return_type = 'json'):
    global request
    return_message = ""
    if return_type.upper() in ("XML", "JSON"): 
        return core.HandleAJAXRequest(action, method, return_type)
    else:
        return_message = "Request invalid"
        request = {"action": action, "method": method, "response_type": return_type}
    return core.HandleAJAXResponse("Error",request, [{'Error': return_message}], return_type, "Error")

@main.route("/ajax/<string:action>/<string:method>", methods=['GET', 'POST'])
@main.route("/ajax/<string:action>/<string:method>.<string:return_type>", methods=['GET', 'POST'])
@login_required
def ajax_helper(action, method, return_type = 'json'):
    global request
    return_message = ""
    if return_type.upper() in ("XML", "JSON"): 
        return core.HandleAJAXRequest(action, method, return_type)
    else:
        return_message = "Request invalid"
        request = {"action": action, "method": method, "response_type": return_type}
    return core.HandleAJAXResponse("Error",request, [{'Error': return_message}], return_type, "Error")

@main.route('/img_proxy', methods=['GET', 'POST'])
@login_required
def image_proxy():
    url = request.args.get('url')
    req = urllib2.Request(url)
    response = urllib2.urlopen(req)
    return Response(response.read(), mimetype="image/jpeg")

@main.route('/upload', methods=['POST'])
@login_required
def upload_file():
    try:
        if 'upload_file' not in request.files:
            flash('No file selected', 'danger')
            return redirect(url_for('main.index'))

        upload_file = request.files['upload_file']
        # if user does not select file, browser also
        # submit a empty part without filename
        if upload_file.filename == '':
            flash('No selected file', 'danger')
            return redirect(redirect(url_for('main.index')))
        if upload_file:
            filename = secure_filename(upload_file.filename)
            path = '%s/%s' % (request.form['upload_dest_path'], filename)
            print path
            if not os.path.exists(path) or request.form['upload_overwrite']:
                upload_file.save(path)
                flash('file uploaded')
            else:
                flash('file unable to be uploaded, already exists', 'danger')
            return redirect(url_for('main.index'))

        flash('Something went wrong with the upload')
        
    except Exception as ex:
        flash(str(ex), 'danger')
    return redirect(url_for('main.index'))

def _view(arg, dl=False):
    try:
        dl_file = request.args.get(arg)
        if not dl_file:
            flash('No file selected', 'danger')
        else:
            return send_from_directory(g.current_folder, dl_file, as_attachment=dl)
    except Exception as ex:
        flash(str(ex), 'danger')
    return redirect(url_for('main.index'))

@main.route('/download', methods=['GET'])
@login_required
def download():
    return _view('dl', True)

@main.route('/view', methods=['GET'])
@login_required
def view():
    return _view('f', False)

@main.route('/edit', methods=['GET'])
@login_required
def edit():
    try:
        e_file = request.args.get('f')
        if not e_file:
            flash('No file selected', 'danger')
        else:
            full_path = '%s/%s' % (g.current_folder, e_file)
            fh = open(full_path, 'r')
            content = ''.join(fh.readlines()).replace('<', '&lt;').replace('>', '&gt;')
            fh.close()
            return render_template("editor.html", title='Edit %s' % full_path, content=content, full_path=full_path)
    except Exception as ex:
        flash(str(ex), 'danger')
    return redirect(url_for('main.index'))
