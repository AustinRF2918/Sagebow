// Entry point of the web application's server.
// to run this as a script, use run.js

module.exports = function(EXPRESS_PORT, EXPRESS_ROOT) {
    // Middleware and libraries that we are attaching todo
    // our actual express application.
    const app = require('express')(),
          bodyParser = require('body-parser'),
          session = require('express-session'),
	  debugMessage = require('./utilities/debug.js').debugMessage,
	  APP_PORT = require("./configuration.js").APP_PORT;

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

    // Routes are defined in app/router.js and individual
    // components can be found in the "router" folder.
    const router = require('./router.js')(app);

    debugMessage("Initialized Express router..");
    debugMessage(`Listening on ${APP_PORT}.`);

    app.listen(APP_PORT);
};
