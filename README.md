Music Generator

To run what we currently have, if you have pycharm, hit run, and go to:
http://127.0.0.1:5000/index 

or if you want to run from command line just type:
python3 -m flask run

python3 should be routed to your current python3 environment, so hypothetically it can be called whatever you want, depending on how you pathed it in your system variables.

If using pycharm:

"Add Configuration" -> "+" -> Flask Server -> Script path and select app.py from directory -> Find correct Python Interpreter

The folder is called static, because Flask required it, I tried calling it "src" but wouldn't work