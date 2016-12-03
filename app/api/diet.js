const EXPRESS_PORT = require('../configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('../configuration.js').EXPRESS_ROOT;
const DEBUG = require('../configuration.js').DEBUG;

const serveFile = require('../helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;
const express = require('express');

const router = express.Router();

// TODO: SEPERATE OUT!!
const redisConn = require('redis').createClient();
const bcrypt = require('bcryptjs');

// Diet endpoint
//
// This is an endpoint for sending over diet information
// from the client side.
router.get('/api/diet', function(req, res) {
    if (DEBUG) {
	console.log("Recieved a GET on /api/diet.");
    }

    res.status(200).send(req.session.userObj.diet);
});

module.exports = router;
