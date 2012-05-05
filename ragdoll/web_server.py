#!/usr/bin/python
from flask import Flask

app = Flask(__name__)

# Real basic static web server
if app.config['DEBUG']:
    from werkzeug import SharedDataMiddleware
    import os
    app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
              '/': os.path.join(os.path.dirname(__file__), 'static')
                  })
                  
if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
