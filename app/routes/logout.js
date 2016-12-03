const serveFile = require('../utilities/serving.js').serveFile,
      debugMessage = require('../utilities/debug.js').debugMessage,
      express = require('express'),
      router = express.Router();

//
// TODO: SEPERATE OUT!!
const redisConn = require('redis').createClient(),
      bcrypt = require('bcryptjs');
//
//


 // Logout/Login endpoint
//
// This is a simple "endpoint", though not exactly an endpoint. 
// It deletes the current user object and redirects the client
// to the login page.
router.get(/^\/log(out|off)$/, function(req, res){
    debugMessage(`Logging out user: ${req.session.userObj.username}`);
    delete req.session.userObj;
    res.redirect('/login');
});

module.exports = router;
