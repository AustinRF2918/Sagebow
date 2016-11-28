const EXPRESS_PORT = require('../configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('../configuration.js').EXPRESS_ROOT;
const DEBUG = require('../configuration.js').DEBUG;

const serveFile = require('../helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;

module.exports = function(app) {
    // Login Static Serve
    //
    // Serves the static markup for the login page.
    const get = function(req, res) {
	if (DEBUG) {
	    console.log("Recieved a GET on /login.");
	}

	serveFile('/login.html', res);
    }

    // Login Endpoint [POST]
    //
    // This is the basic way that we go about logging a user in.
    const post = function(req, res) {
	const neededFields = new Set([
	    'username',
	    'password'
	]);

	// A mapping of all required fields onto the request body:
	// in the case that all objects are mapped, the filter
	// later on will create an array of length zero, indicating
	// that all of our data was on the body of the request, otherwise,
	// an error will be indicated.
	const fields = Array.from(neededFields.values())
	    .map((item) => req.body[item])
	    .filter((item) => item === null || item === undefined);


	// Make sure all of our fields were filtered out.
	// Otherwise send a malformed error code.
	if (fields.length !== 0) {
	    res.status(422).send('Malformed');
	    return;
	}

	// Trim the the now known to be filled
	// username and passwords portions of
	// the body and set it equal to the
	// respective variables
	const username = req.body.username.trim();
	const password = req.body.password.trim();


	// Attempt to retrieve a username from the redis
	// cache: this may have multiple outcomes.
	app.redisConn.get(username, (err, userObj) => {
	    userObj = JSON.parse(userObj);

	    if (err) {
		// Send a 500 internal server error in the
		// case that some error was thrown on trying
		// to connect to the Redis database.
		res.status(500).send('Error');
	    } else if (!userObj) {
		// Send a not found in the case that no user
		// object is found for the cooresponding username.
		res.status(404).send('Not Found');
	    } else if (!app.bcrypt.compareSync(password, userObj.passwordHash)) {
		// Send a malformed in the case that the password
		// doesn't quite match up.
		res.status(422).send('Malformed');
	    } else {
		// If none of these cases have happened, create a user object
		// of the specific client that is attempting to log in and
		// send a 200 status code.
		req.session.userObj = userObj;
		res.sendStatus(200);
	    }
	});
    }

    return {
	get,
	post
    }
}
