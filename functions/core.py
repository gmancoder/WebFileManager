#!/usr/bin/env python
import re
import unidecode
import datetime
from flask import redirect, url_for, g, request, flash, session
from flask_login import current_user, AnonymousUserMixin
import ajax
import folders
import xml.sax.saxutils as sax
import json
import pycountry
import base64
import urllib
import urllib2
import os
import smtplib
import traceback
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

def root():
    return '/projects/P01934/Web_Code_Manager_Development'

def Init():
    if 'root_folder' in session and session['root_folder'] not in (None, "None", ""):
        g.root_folder = session['root_folder']

    if 'current_folder' in session and session['current_folder'] not in (None, 'None', ''):
        g.current_folder = session['current_folder']
    else:
        try:
            g.current_folder = g.root_folder
            session['current_folder'] = g.current_folder
        except:
            pass
    if 'tfs' in session and session['tfs'] not in (None, 'None', ''):
        g.tfs = session['tfs']
    else:
        g.tfs = False

def GetProjects():
    fh = open('/projects/projects.def', 'r')
    projects = []
    for line in fh.readlines():
        number = line[0:5]
        name = line[50:150]
        if number.strip() != "" and name.strip() != "":
            projects.append('P%s - %s' % (number, name))
    fh.close()
    return sorted(projects)

def GenerateAlias(s):
    clean_str = re.sub(r'[^0-9A-Za-z]', '_', s)
    return clean_str.lower()

def HandleAJAXRequest(action, method, response_type):
    status, status_msg, request, results = ajax.Request(action, method, response_type)
    result_type = "Result"
    if not status:
        result_type = "Error"
    return HandleAJAXResponse(status_msg, request, results, response_type, result_type)

def HandleAJAXResponse(msg, request, results, type, result_type):
    if type.upper() == "JSON":
        response = {"Status": msg, "Request": request, "%ss" % result_type: results}
        return json.dumps(response)
    else:
        xml = """<?xml version="1.0" ?><Response>
        <Status>%s</Status>
        <Request>
        <Action>%s</Action>
        <Method>%s</Method>
        <Response_Type>%s</Response_Type>
        </Request>
        <%ss>""" % (msg, request['action'], request['method'], request['response_type'], result_type)
        for result in results:
            xml += "<%s>" % result_type
            for key, value in result.items():
                xml += "<%s>%s</%s>" % (sax.escape(key), sax.escape(value), sax.escape(key))
            xml += "</%s>" % result_type
        xml += """</%ss>
        </Response>""" % result_type
        return xml

def GetDateRange(date_ymd, days):
    time = datetime.datetime.strptime(date_ymd, "%Y%m%d")
    time_end = time + datetime.timedelta(days=7)
    dates = []
    while time <= time_end:
        dates.append(time.strftime("%Y%m%d"))
        time = time + datetime.timedelta(days=1)

    return time, time_end, dates

def ImageProxy(content):
    matches = re.findall('src="([^"]+)"',content)
    prefix = "/img_proxy?url="
    print matches
    for match in matches:
        repl = prefix + match
        print repl
        content = content.replace(match,repl)

    return content