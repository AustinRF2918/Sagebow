const serveFile = require('../utilities/serving.js').serveFile,
      debugMessage = require('../utilities/debug.js').debugMessage,
      attemptSave = require('../utilities/database.js').attemptSave,
      express = require('express'),
      router = express.Router();

//
// TODO: SEPERATE OUT!!
const redisConn = require('redis').createClient(),
      bcrypt = require('bcryptjs');
//
//

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
    const values = validateRequest(['date'], req, res);

    // Attempt to create a date object from the URI passed into req.params.date.
    // In the case that it is not possible, the data is malformed.
    try {
	req.session.userObj.lastUpdated = new Date(decodeURI(values['date']));
    } catch(error) {
	res.status(422).send('Malformed');
    }

    // Attempt to save into the database.
    try {
	attemptSave(req, res, redisConn, req.session.userObj);
	res.sendStatus(200);
    } catch(error) {
	res.status(500).send('Error');
    }
});

module.exports = router;
