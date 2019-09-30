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


APP = Flask(__name__)
APP.register_blueprint(music)
