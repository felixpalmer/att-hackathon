import doll

class DollManager(object):

    def __init__(self):
        self.dolls = {}

    def get(self, doll_id):
        if doll_id not in self.dolls:
            self.dolls[doll_id] = doll.Doll()
        return self.dolls[doll_id]
