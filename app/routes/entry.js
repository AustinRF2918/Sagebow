const EXPRESS_PORT = require('../configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('../configuration.js').EXPRESS_ROOT;
const DEBUG = require('../configuration.js').DEBUG;

const serveFile = require('../helpers.js').serveFile;
const express = require('express');

const router = express.Router();

// TODO: SEPERATE OUT!!
const redisConn = require('redis').createClient();
const bcrypt = require('bcryptjs');

// Entry Static Serve
//
// Serves the static markup for the setup page.
router.get('/entry', function(req, res) {
    if (DEBUG) {
	console.log("Recieved a GET on /entry.");
    }

    serveFile('entry.html', res);
});

module.exports = router;
