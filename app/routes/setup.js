const EXPRESS_PORT = require('../configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('../configuration.js').EXPRESS_ROOT;
const DEBUG = require('../configuration.js').DEBUG;

const serveFile = require('../helpers.js').serveFile;
const express = require('express');

const router = express.Router();

// TODO: SEPERATE OUT!!
const redisConn = require('redis').createClient();
const bcrypt = require('bcryptjs');

// Setup Static Serve
//
// Serves the static markup for the setup page.
router.get('/setup', function(req, res) {
    if (DEBUG) {
	console.log("Recieved a GET on /setup.");
    }

    serveFile('/setup.html', res);
});

// Setup Endpoint
//
// This is served client side by the setup.html file. It handles
// the general creation of user accounts from the server side,
// making sure all the data is sanitized and other good stuff.
router.post('/setup', function(req, res) {

    // Set of needed fields that must be sent to the endpoint
    // by Sagebow's front-end. These roughly coorespond to
    // a user model that we may create later on for more
    // robust handling of user objects.
    const neededFields = new Set([
	'username',
	'password',
	'weight',
	'height',
	'age',
	'bmi',
	'bmr',
	'activitySelector',
	'goalSelector',
	'genderSelector',
	'dailyCalories'
    ]);

    if (DEBUG) {
	console.log(req.body);
    }

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
	if (DEBUG) {
	    console.log("Got malformed data in setup.js.");
	}

	res.status(422).send('Malformed');
	return;
    }

    // A fairly sophisticated check upon all of the data that
    // is required in our request body. In the case that a
    // regex doesn't pass, we will send a malformed code.

    // POTENTIAL CANIDATE FOR METHOD EXTRACTION.
    try {
	if (
	    req.body.username.toString().match(/[0-9a-z]{3,}/i) !== null &&
	    req.body.password.toString().match(/.{6,}/) !== null &&
	    parseFloat(req.body.weight) > 0 &&
	    parseFloat(req.body.bmi) > 0 &&
	    parseFloat(req.body.dailyCalories > 0)) {
		res.status(422).send('Malformed');
		return;
	}
    } catch(e) {
	if (DEBUG) {
	    console.log("Got malformed data in setup.js.");
	}

	res.status(422).send('Malformed');
	return;
    }

    const userObj = {
	username: req.body.username,
	passwordHash: bcrypt.hashSync(req.body.password),
	weightHistory: [{
	    weight: req.body.weight,
	    timestamp: new Date()
	}],
	weight: req.body.weight,
	lastUpdated: new Date(),
	bmi: req.body.bmi,
	diet:{
	    goal:req.body.goal,
	    dailyCalories:req.body.dailyCalories
	},
	nutrientHistory: []
    };

    // POTENTIAL CANIDATE FOR METHOD EXTRACTION.
    // Here we create a promise object that will first attempt
    // a connection on our Redis cache, and following this will
    // attempt to save the user object.
    new Promise((resolve, reject) => {
	// First, we must vertify that a user does not exist in
	// our database.
	redisConn.get(userObj.username, (err, reply) => {
	    if (err) {
		// Some error happened while we where querying the
		// cache.
		if (DEBUG) {
		    console.log("Got error data in setup.js.");
		}

		res.status(500).send('Error');
		reject(err);
	    } else if (reply) {
		if (DEBUG) {
		    console.log("Got conflict data in setup.js.");
		}

		res.status(409).send('Conflict');
	    } else {
		resolve();
	    }
	})
    }).then(() => {
	// POTENTIAL CANIDATE FOR METHOD EXTRACTION.
	new Promise((resolve, reject) => {
	    // Now that all our preconditions are fullfilled, let's try to
	    // save our user object into the Redis cache.
	    redisConn.set(userObj.username, JSON.stringify(userObj), (err) => {
		if (err) {
		    // Our Redis connection returned an error.
		    if (DEBUG) {
			console.log("Got error data in setup.js.");
		    }

		    res.status(500).send('Error');
		    reject(err);
		} else {
		    // Our Redis connection indicated that our save was successful.
		    if (DEBUG) {
			console.log("Got final success data in setup.js.");
		    }
		    res.status(200).send('Success');
		    resolve();
		}
	    });
	}).catch(function(err) {
	    // Some generic error went wrong in our connection too the Redis cache.
	    res.status(500).send('Error');
	    reject(err);
	});
    });
});

module.exports = router;
