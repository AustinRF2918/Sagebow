const EXPRESS_PORT = require('../configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('../configuration.js').EXPRESS_ROOT;
const DEBUG = require('../configuration.js').DEBUG;

const serveFile = require('../helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;
const express = require('express');

const router = express.Router();

// TODO: SEPERATE OUT!!
const redisConn = require('redis').createClient();
const bcrypt = require('bcryptjs');

// Setup Static Serve
//
// Serves the static markup for the setup page.
router.get('/metrics', function(req, res) {
    if (DEBUG) {
	console.log("Recieved a GET on /setup.");
    }

    serveFile('metrics.html', res);
});

module.exports = router;
