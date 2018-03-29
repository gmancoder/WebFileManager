#!/usr/bin/env python
from flask import Flask
from flask_script import Manager
from models.shared import login_manager
import os
from routes.main import main
app = Flask(__name__)
app.secret_key = os.urandom(24)
app.jinja_env.autoescape = False
login_manager.login_view = "main.login"
login_manager.init_app(app)
app.register_blueprint(main)

manager = Manager(app)
if __name__ == '__main__':
    manager.run()