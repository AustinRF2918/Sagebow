const EXPRESS_PORT = require('./configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('./configuration.js').EXPRESS_ROOT;
const DEBUG = require('./configuration.js').DEBUG;

const serveFile = require('./helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;


module.exports = function(app) {
    const loginController = require('./controllers/login.js')(app);
    const setupController = require('./controllers/setup.js')(app);

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

    // GETS and POSTS for the login page.
    app.get('/login', loginController.get);
    app.post('/login', function(req, res) {
	console.log(req.body);
	loginController.post(req, res);
    });

    // GETS and POSTS for the setup page.
    app.get('/setup', setupController.get);
    app.post('/^\setup$/', setupController.post);
}
