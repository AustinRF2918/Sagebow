const EXPRESS_PORT = require('../configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('../configuration.js').EXPRESS_ROOT;
const DEBUG = require('../configuration.js').DEBUG;

const serveFile = require('../helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;
const express = require('express');

const router = express.Router();

// TODO: SEPERATE OUT!!
const redisConn = require('redis').createClient();
const bcrypt = require('bcryptjs');

 // Logout/Login endpoint
//
// This is a simple "endpoint", though not exactly an endpoint. 
// It deletes the current user object and redirects the client
// to the login page.
router.get(/^\/log(out|off)$/, function(req, res){
    if (DEBUG) {
	console.log(`Logging out user: ${req.session.userObj.username}`);
    }

    delete req.session.userObj;
    res.redirect('/login');
});

module.exports = router;
