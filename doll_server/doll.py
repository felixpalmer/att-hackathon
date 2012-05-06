import tornado.ioloop
import time

class Doll(object):

    def __init__(self):
        self.component_updates = {}
        self.listener = None
        self.timeout = None

    def add_update(self, component, update):
        if component not in self.component_updates:
            self.component_updates[component] = []
        self.component_updates[component].append(update)

        if self.listener is not None:
            self.make_callback()

    def make_callback(self):
        self.listener({
            "components":
                [ { "component": component_id,
                    "updates": self.component_updates[component_id]
                  } for component_id in self.component_updates]
        })
        self.component_updates = {}
        self.listener = None

        if self.timeout is not None:
            tornado.ioloop.IOLoop.instance().remove_timeout(self.timeout)

    def get_updates(self, listener):

        self.listener = listener
        if len(self.component_updates) > 0:
            self.make_callback()
        else:
            self.timeout = tornado.ioloop.IOLoop.instance().add_timeout(time.time() + 30.0,
                                                                        self.do_timeout)

    def do_timeout(self):
        if self.listener is not None:
            self.listener({
                "components": []
            })
            self.listener = None
        self.timeout = None
