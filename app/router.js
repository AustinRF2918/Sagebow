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

    app.use(require('./routes/login.js'));
    app.use(require('./routes/setup.js'));

    // * Path
    //
    // In the case that neither login or setup were called, we use
    // this wildstar pattern to check for the existance of a user
    // session object.
    app.get('*', function(req, res, next) {
        if (req.session.userObj) {
            next();
        } else {
            res.redirect('/login');
        }
    });

    // Private static routes and their (possible) associated APIs.
    app.use(require('./routes/logout.js'));
    app.use(require('./routes/delete.js'));
    app.use(require('./routes/metrics.js'));
    app.use(require('./routes/entry.js'));

    // Private API Endpoints.
    app.use(require('./api/consumption.js'));
    app.use(require('./api/diet.js'));
    app.use(require('./api/foods.js'));
    app.use(require('./api/lastUpdated.js'));
    app.use(require('./api/query.js'));
    app.use(require('./api/weight.js'));
};
