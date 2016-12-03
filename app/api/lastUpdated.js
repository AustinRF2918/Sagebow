const EXPRESS_PORT = require('../configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('../configuration.js').EXPRESS_ROOT;
const DEBUG = require('../configuration.js').DEBUG;

const serveFile = require('../helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;
const express = require('express');

const router = express.Router();
const attemptSave = require('../helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).attemptSave;

// TODO: SEPERATE OUT!!
const redisConn = require('redis').createClient();
const bcrypt = require('bcryptjs');


// Last Updated Endpoint [GET]
//
// This is an endpoint for getting the last update
// on our client object.
router.get('/api/lastUpdated',function(req, res) {
    res.status(200).send(req.session.userObj.lastUpdated);
});

// Last Updated At Date Endpoint [GET]
//
// Gets the last update at a date.
// on our client object.
// May not be used?
// DEAD CODE.
router.get('/api/lastUpdated/:date',function(req,res){
    const neededFields = new Set([
	'date'
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

    // Attempt to create a date object from the URI passed into req.params.date.
    // In the case that it is not possible, the data is malformed.
    try {
	req.session.userObj.lastUpdated = new Date(decodeURI(req.params.date));
    } catch(error) {
	res.status(422).send('Malformed');
	return;
    }

    // Attempt to save into the database.
    try {
	attemptSave(req, res, redisConn, req.session.userObj);
	res.sendStatus(200);
	return;
    } catch(error) {
	res.status(500).send('Error');
	return;
    }
});

module.exports = router;
