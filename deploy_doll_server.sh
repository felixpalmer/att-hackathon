#!/bin/sh
ssh thomas@50.56.70.123 "pkill python"
tar czf /tmp/dollserver.tgz doll_server
scp /tmp/dollserver.tgz thomas@50.56.70.123:~
ssh thomas@50.56.70.123 "tar xzf dollserver.tgz; python doll_server/doll_server.py"
