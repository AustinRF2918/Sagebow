const debugMessage = require("./utilities/debug.js").debugMessage
const express = require('express')
const path = require('path')

module.exports = function(app) {
    // Public Routes
    //
    // All of the following routes are public. This means
    // that they do not require a user object to be created
    // and authenticated to view.
    app.use(express.static(path.join(process.cwd(), 'public')))

    app.use(require('./routes/login.js'));
    app.use(require('./routes/setup.js'));

    // * Path
    //
    // In the case that neither login or setup were called, we use
    // this wildstar pattern to check for the existance of a user
    // session object.
    app.all('*', function(req, res, next) {
        if (req.session.userObj) {
	    debugMessage(`Authenticated client is begin granted access to private routes and API.`);
            next();
        } else {
	    debugMessage(`Client is unauthenticated! Redirecting to login.`);
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
