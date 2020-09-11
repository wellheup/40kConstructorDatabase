This is a student project for a Databases course.

If you haven't run before in this location, you may have to run npm install
    in this directory to get all of the packages installed to run

In order to host the database on localhost, follow the directions here:
    https://www.cloudways.com/blog/setup-mysql-database-localhost/
    they will use xampp to host phpmyadmin locally to host the required database

You will probably have to change the httpd.config file for Apache so that it runs
    the port listens on something other than 80 like 8080 or some such

*Locally hosting should not require a password in code to access

Once you are running off of xampp, you should be able to load
    http://localhost:8080/phpmyadmin/index.php in browser by clicking
    Admin next to MySql in the xampp control panel where you'll want to 
    import the included cs340_wellheup (4).sql to initialize the database

*Leave xampp running in order to maintain the database for access

Finally, host the website by executing "node app.js" in this directory
    and navigate to http://localhost:4361/ to view the database in browser

    for repeated use while editing consider installing nodemon 
        "npm i -g nodemon" and running with command "nodemon"