const debugMessage = require('../utilities/debug.js').debugMessage,
    express = require('express'),
    router = express.Router();

// Diet endpoint
//
// This is an endpoint for sending over diet information
// from the client side.
router.get('/api/diet', function(req, res) {
    debugMessage("Recieved a GET on /api/diet.");
    console.log(req.session.userObj);
    res.status(200).send(req.session.userObj.diet);
});

module.exports = router;
