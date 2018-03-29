#!/usr/bin/env python

import os
import sys
import json
import base64
import math
import binascii
CONFIG = '/projects/P01934/Web_Code_Manager_Development/config/config.json'

def ReadConfig():
    if not os.path.exists(CONFIG):
        return False, "Config file missing"
    fh = open(CONFIG, 'r')
    content = ''.join(fh.readlines())
    fh.close()
    try:
        return True, json.loads(content)
    except Exception as ex:
        return False, str(ex)

def GetConfigSection(name):
    status, config = ReadConfig()
    if not status:
        return None
    if name in config:
        return config[name]
    else:
        return None

def HashPassword(password):
    return base64.b64encode(password)

def UnHashPassword(hashed):
    return base64.b64decode(hashed)

def GetConfigSetting(tag):
    settings = GetConfigSection('config')
    if tag in settings:
        return settings[tag]
    return None