Development Requirements:
==========
On Mac or Linux (Windows hasn't been used to date)

0. Install nodejs, see: https://github.com/joyent/node
1. Install meteor, see: docs.meteor.com
2. Make sure you have a local mongodb instance to use or get a test one at mongohq.com
3. Sublime2 is the preferred text editor of this project

To Run Locally:
============

0. From the project's root dir: 'meteor run' (optionally specifying a port and mongodb url)
1. If you didn't specify a port, open up Google Chrome to localhost:3000
2. Profit!

Current Servers:
============
(Note: might not be updated frequently enough!)
- GitHub repo location: https://github.com/resellhotel/rusty.git
- Test Rackspace Webserver: 198.101.202.238
- Test MongoDB: mongodb://test:rus1ty@flame.mongohq.com:27073/rusty-mongo

Production Deploy:
============

Coming soon (once we setup a prod server). For now, just use the same steps as for a test server.

Test Server Deploy:
============

1. Set up a test server to use, if necessary.
2. cd ~/src/rusty; git pull <desired-commit/tag>
3. git submodule update
4. meteor bundle /tmp/bundle.tgz
5. cd ~/hosted; tar -zxf /tmp/bundle.tgz
6. export MONGO_URL='mongodb://user:password@host:port/databasename'
7. node bundle/main.js

Test Server Setup:
============
1. Spin up new RackSpace server
2. apt-get install curl
3. curl install.meteor.com | /bin/sh
4. Install node+npm with these instructions: https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
5. npm install fibers  # might need to install globally with -g
6. Clone github repo into ~/src
7. cd ~/src/rusty; git submodule init; git submodule update;
8. mkdir ~/hosted
