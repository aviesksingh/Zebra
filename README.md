# Zebra
Project Team Management Application



ZEBRA
README
REQUIREMENTS
OS: Windows/Linux/MacOS
Environment: Node (install from https://nodejs.org/en/ ), Python 2.7 and Flask
( http://flask.pocoo.org/ )
Installing the dependencies
Using the terminal go to the root of the folder and run the following commands:
npm install
Running the Frontend Server
npm start
It will run the server on port 3000 by default. If you want to change the port, edit
package.json in the root folder and change the “start:” script to "start": "PORT=8080
react-scripts start"
Running the Application Server
cd server/
python api.py
Install the dependencies using pip ( https://pypi.org/project/pip/ )
This is standalone server, it can be moved from the project structure and run on separate
machine
Real-time (RTC) server is running on our AWS instance: http://52.15.83.136:3000/ , written
in JS. The code is available in RTC/ directory at root. The server can be run using the
following commands as a separate service.
cd RTC/
npm install
npm start (or > node index.js)
MongoDB server is running as a separate cluster on MongoDB Atlas,
https://www.mongodb.com/cloud/atlas (as mentioned in the report).
You can connect and check out the schema and data using the following credentials.
mongodb+srv://root:qwerty1234@zebra-0d9rq.mongodb.net/admin
NOTE: Google authentication only works on qualified domain names or on localhost in
development mode. If you face any problem, logging in do let us know ( apsaini@syr.edu )
and we will enable it on your IP and port.
