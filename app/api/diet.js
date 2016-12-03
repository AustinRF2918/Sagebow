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

// Diet endpoint
//
// This is an endpoint for sending over diet information
// from the client side.
router.get('/api/diet', function(req, res) {
    debugMessage("Recieved a GET on /api/diet.");
    res.status(200).send(req.session.userObj.diet);
});

module.exports = router;
