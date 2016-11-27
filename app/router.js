const EXPRESS_PORT = require('./configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('./configuration.js').EXPRESS_ROOT;

const serveFile = require('./helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;

const loginController = require('./controllers/login.js');

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

    // Login Static Serve
    //
    // Serves the static markup for the login page.
    app.get('/login', loginController.loginGet);
    app.post(/^\/login$/, loginController.loginPost);
}
