#!/usr/bin/env python

import config
import hashlib
from models.users import *

def UserDictToObj(user_dict):
    u = User()
    u.set_from_dict(user_dict)
    return u

def GetUserByField(field, field_value):
    users = config.GetConfigSection('users')
    if users != None:
        for u in users:
            if str(u[field]) == str(field_value):
                return UserDictToObj(u)
    return None

def GetUserByID(id):
    return GetUserByField('id', id)

def GetUserByName(username):
    return GetUserByField('username', username)

def CheckLogin(username, password):
    user = GetUserByName(username)
    if user != None:
        if user.password == config.HashPassword(password):
            return user
    return None