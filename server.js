module.exports = function(EXPRESS_PORT, EXPRESS_ROOT) {
    // Middleware and libraries that we are attaching todo
    // our actual express application.
    const app = require('express')(),
          bodyParser = require('body-parser'),
          session = require('express-session'),
	  request = require('request'),
	  redisConn = require('redis').createClient(),
	  bcrypt = require('bcryptjs');

    // Self defined functions and configurations for out application.
    const serveFile = require('./app/utilities/serving.js').serveFile,
	  debugMessage = require('./app/utilities/debug.js').debugMessage,
	  APP_PORT = require("./app/configuration.js").APP_PORT;

    debugMessage("Initialized ExpressJS dependencies.");

    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(session({
        secret: require('hat')(),
        resave: false,
        saveUninitialized: false
    }));

    debugMessage("Initialized ExpressJS middleware.");

    // Self defined modules in the application folder
    const router = require('./app/router.js')(app);

    debugMessage("Initialized Express router..");

    debugMessage(`Listening on ${APP_PORT}.`);
    app.listen(APP_PORT);
};
