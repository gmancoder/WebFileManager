#!/usr/bin/env python
from flask_login import AnonymousUserMixin, UserMixin
import datetime
import uuid

class User(UserMixin):
    def __init__(self, id=None, name=None, email=None, username=None, passwd=None):
        self.id = id
        self.name = name
        self.email = email
        self.username = username
        self.password = passwd

    def set_from_dict(self, user_dict):
        self.id = user_dict['id']
        self.name = user_dict['name']
        self.email = user_dict['email']
        self.username = user_dict['username']
        self.password = user_dict['password']
