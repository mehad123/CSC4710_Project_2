Wwelcome to bestsite.com. 

For working without Docker:

You can copy these into your .env:

DB_USER=(your username)
DB_PASSWORD=(your password)
DB_DATABASE=web_app 
DB_HOST=localhost
DB_PORT=3306
APP_PORT=5050

Then, place this .env in the Backend directory

cd Backend;
npm install;
npm start;

Then open index.html.

For working with Docker: 

You can copy these into your .env (not a security issue Docker makes images on the spot so we can make up some values):

DB_USER=user1
DB_PASSWORD=12345
DB_ROOT_PASSWORD=54321
DB_DATABASE=web_app
DB_HOST=mysql
DB_PORT=3306
APP_PORT=5050

Then, place this .env in the root directory,
"docker compose up" to run
"docker compose up --build" to run (after you change code)

Then open index.html.
