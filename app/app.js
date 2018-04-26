// Entry point of the web application's server.
// to run this as a script, use run.js
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const hat = require('hat')
const path = require('path')
const sass = require('node-sass-middleware')

const debugMessage = require('./utilities/debug.js').debugMessage
const APP_PORT = require("./configuration.js").APP_PORT
const router = require('./router.js')

module.exports = function() {
    // Middleware and libraries that we are attaching todo
    // our actual express application.
    const app = express()

    debugMessage("Initialized ExpressJS dependencies.");

    app.set('views', path.join(process.cwd(), 'pug'))
    app.set('view engine', 'pug')

    app.use(sass({
      src: './sass',
      dest: path.join(process.cwd(), 'public', 'res', 'css'),
      prefix: '/res/css'
    }))

    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(session({
        secret: hat(),
        resave: false,
        saveUninitialized: false
    }));

    debugMessage("Initialized ExpressJS middleware.");

    // Routes are defined in app/router.js and individual
    // components can be found in the "router" folder.
    router(app);

    debugMessage("Initialized Express router..");
    debugMessage(`Listening on ${APP_PORT}.`);

    app.listen(APP_PORT);
};
