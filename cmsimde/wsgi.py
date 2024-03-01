#!/usr/bin/python

"""Flask startup script
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__)))
# import flaskapp at the same directory
import flaskapp

# get uwsgi, ip and port variable values of flaskapp.py
uwsgi = flaskapp.uwsgi
ip = flaskapp.ip
port = flaskapp.dynamic_port

if uwsgi:
    # run on remote site
    application = flaskapp.app
else:
    # on localhost, on Linux or Mac need to use python3 wsgi.py to execute
    flaskapp.app.run(host=ip, port=port, debug=True, ssl_context="adhoc")
