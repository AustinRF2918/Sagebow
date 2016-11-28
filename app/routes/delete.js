const EXPRESS_PORT = require('../configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('../configuration.js').EXPRESS_ROOT;
const DEBUG = require('../configuration.js').DEBUG;

const serveFile = require('../helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;
const express = require('express');

const router = express.Router();

// TODO: SEPERATE OUT!!
const redisConn = require('redis').createClient();
const bcrypt = require('bcryptjs');

// Delete Static Serve
//
// Serves the static markup for the Delete page.
router.get('/delete',function(req,res){
    serveFile('delete.html', res);
});

// Delete endpoint
//
// This is a simple "endpoint", though not exactly an endpoint. 
// It deletes the current user object and redirects the client
// to the login page.
router.post('/delete', function(req, res) {
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

    const username = req.body.username.trim();
    const password = req.body.password.trim();

    // Attempt user lookup
    redisConn.get(username, (err, userObj) => {
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
	} else if (!bcrypt.compareSync(password, userObj.passwordHash)) {
	    // Send a malformed in the case that the password
	    // doesn't quite match up.
	    res.status(422).send('Malformed');
	} else {
	    // If none of these cases have happened, create a user object
	    // of the specific client that is attempting to log in and
	    // send a 200 status code.
	    redisConn.del(username);
	    res.sendStatus(200);
	}
    });
});

module.exports = router;
