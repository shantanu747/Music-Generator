from flask import Flask, Blueprint, send_file, send_from_directory, jsonify
from flask import render_template, request, flash, redirect

#Steps to adding a new URL/route
#1.) do @music.route(/name_of_index)
#2.) run any python scripts, and return

#Examples return render_template("html/something.html", results = '') <- you can send back variables
#You can choose between GET and POST such as:
# @music.route('/name_of_html', methods=['GET']) or ... , methods=['POST'])
#The way to find out is through a request.method == 'GET' or 'POST'

music = Blueprint('music', __name__, template_folder='static/html')


@music.route('/index')
def index():
    return render_template('index.html')

@music.route('/example', methods=['POST'])
def example():
    from pathlib import Path
    from werkzeug.utils import secure_filename
    if request.method == 'POST':
        my_data = request.form
        file = my_data['file'] #form section name
        if my_data and allowed_file(my_data.filename):
            filename = str((Path('uploads') / secure_filename(file.filename)).absolute().resolve())
            import os
            file.save(filename)

# Checks to see if file is of correct type
# Input filename
# Output True or False
def allowed_file(filename):  # http://flask.pocoo.org/docs/1.0/patterns/fileuploads/
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


ALLOWED_EXTENSIONS = {'wav'}
APP = Flask(__name__)
APP.register_blueprint(music)
