const debugMessage = require("./app/helpers.js").debugMessage;
const APP_PORT = require("./app/configuration.js").APP_PORT;

module.exports = function(EXPRESS_PORT, EXPRESS_ROOT) {
    // Used modules
    const app = require('express')(),
        bodyParser = require('body-parser'),
        session = require('express-session'),
	request = require('request'),
	redisConn = require('redis').createClient(),
	bcrypt = require('bcryptjs');

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
    const router = require('./app/router.js')(app),
	  serveFile = require('./app/helpers.js').serveFile,
	  attemptSave = require('./app/helpers.js').attemptSave;

    debugMessage("Initialized Express router..");

    debugMessage(`Listening on ${APP_PORT}.`);
    app.listen(APP_PORT);
};
