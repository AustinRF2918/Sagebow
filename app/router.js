const EXPRESS_PORT = require('./configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('./configuration.js').EXPRESS_ROOT;
const DEBUG = require('./configuration.js').DEBUG;

const serveFile = require('./helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;

let express = require('express');
let router = express.Router();


module.exports = function(app) {
    // Routes any URL passed to our application
    // to the next possible routes.
    app.all('*', (req, res, next) => {
        next();
    });

    // Public Routes
    // 
    // All of the following routes are public. This means
    // that they do not require a user object to be created
    // and authenticated to view.
    app.get(/^\/res\/.+/, function(req, res) {
        serveFile(req.url.match('[^?#]+')[0], res);
    });

    app.use(require('./controllers/login.js')(app));
    app.use(require('./controllers/setup.js')(app));
}
