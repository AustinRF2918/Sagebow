module.exports = function(EXPRESS_PORT, EXPRESS_ROOT) {
    // Used modules
    const app = require('express')(),
        bodyParser = require('body-parser'),
        session = require('express-session'),
	request = require('request'),
	redisConn = require('redis').createClient(),
	bcrypt = require('bcryptjs');

    // Application Configuration
    const APP_PORT = 4001;

    // API Key for the USDA API.
    const API_KEY = 'DJJzSXqqAhl30URUOtKfmsZJkEZESNEqiKg58CxC';

    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(session({
        secret: require('hat')(),
        resave: false,
        saveUninitialized: false
    }));

    // Self defined modules in the application folder
    const router = require('./app/router.js')(app),
	  serveFile = require('./app/helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile,
	  attemptSave = require('./app/helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).attemptSave;

    app.listen(APP_PORT);
};
