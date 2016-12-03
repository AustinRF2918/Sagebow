const EXPRESS_PORT = require('../configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('../configuration.js').EXPRESS_ROOT;
const DEBUG = require('../configuration.js').DEBUG;

const serveFile = require('../helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;
const express = require('express');

const router = express.Router();

// TODO: SEPERATE OUT!!
const redisConn = require('redis').createClient();
const bcrypt = require('bcryptjs');

// Consumption Endpoint [POST]
//
// Set a consumption event that has fats, proteins
// carbs, and a name.
router.post('/api/consumption', function(req, res) {
    const neededFields = new Set([
	'fats',
	'proteins',
	'carbs',
	'name'
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
    }

    // Set our data equal to the request body which we have
    // ensured exists.
    try {
	const carbs = parseFloat(req.query.carbs),
		fats = parseFloat(req.query.fats),
		proteins = parseFloat(req.query.proteins),
		name = req.query.name,
		timestamp = (req.query.timestamp && new Date(req.query.timestamp))|| new Date();
    } catch(error) {
	// The data was in some way unparseable. Therefore,
	// it was malformed.
	res.status(422).send('Malformed');
    }

    // Used in case of failure. Deep copy
    const cachedUser = JSON.parse(JSON.stringify(req.session.userObj));

    // Add entry
    req.session.userObj.nutrientHistory.unshift({
	calories: 4 * carbs + 9 * fats + 4 * proteins,
	carbs: carbs,
	fats: fats,
	proteins: proteins,
	name: name,
	timestamp: timestamp
    });

    try {
	attemptSave(req, res, redisConn, cachedUser);
    } catch(error) {
	// Some error happened with the connection to the database.
	res.sendStatus(200);
	res.status(500).send('Error');
    }
});

// Consumption Endpoint [GET]
//
// Gets a list of all consumptions from a 
// given time span.
router.get('/api/consumption', function(req, res) {
    let timeRange = [req.query.min, req.query.max]
	.map((item) => {
	    if (item) {
		return new Date(item)
	    } else {
		return undefined
	    }
	});

    const [minTime, maxTime] = [timeRange[0], timeRange[1]];

    const results = req.session.userObj.nutrientHistory
	    .filter((weightEvent) => {
	    if (!minTime || minTime <= new Date(weightEvent.timestamp)) {
		// If we do not have a minimum time entered OR the weight
		// event is in range of the weight event time stamp, check
		// the upperbound
		if (!maxTime || maxTime >= new Date(weightEvent.timestamp)) {
		    // If we do not have a maximum time entered OR the weight
		    // event is in range of the weight event time stamp, return
		    // true.
		    return true;
		} else {
		    // The time wasn't in range of the maximum.
		    return false;
		}
	    } else {
		// The time wasn't in range of the minimum.
		return false;
	    }
    });

    // Allows us to filter out client side objects.
    res.status(200).send(results);
});

module.exports = router;
