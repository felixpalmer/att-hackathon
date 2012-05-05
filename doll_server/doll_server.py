import tornado.web
import tornado.ioloop
import dollmanager
import json
import os.path

class BaseHandler(tornado.web.RequestHandler):

    def initialize(self, manager):
        self.manager = manager

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")

class DollHandler(BaseHandler):

    @tornado.web.asynchronous
    def get(self, doll_id):
        doll = self.manager.get(doll_id)
        doll.get_updates(self.handle_updates)

    def handle_updates(self, updates):
        self.set_header("Content-Type", "application/json")
        self.write(json.dumps(updates))

class ComponentHandler(BaseHandler):

    def initialize(self, manager):
        self.manager = manager

    def post(self, doll_id, component_id):
        update = json.loads(self.request.body)
        doll = self.manager.get(doll_id)
        doll.add_update(component_id, update)

if __name__ == "__main__":

    manager = dollmanager.DollManager()

    settings = {
        "static_path": os.path.join(os.path.dirname(__file__), "static")
    }

    application = tornado.web.Application([
        (r"/doll/(\w+)/updates/", DollHandler, { "manager": manager }),
        (r"/doll/(\w+)/(\w+)/updates/", ComponentHandler, { "manager": manager })
    ], **settings)
    application.listen(8888, "50.56.70.123")
    tornado.ioloop.IOLoop.instance().start()
