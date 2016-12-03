const debugMessage = require('../utilities/debug.js').debugMessage,
      attemptSave  = require('../utilities/database.js').attemptSave,
      express = require('express'),
      router = express.Router(),
      redisConn = require('../configuration.js').REDIS_CONNECTION;

// Weight endpoint [POST]
//
// This is an endpoint for sending over weight updates
// from the client side.
router.post('/api/weight', function(req, res) {
    debugMessage("Recieved a POST on /api/weight.");

    const values = validateRequest(['value'], req, res);
    const timestamp = (req.body.timestamp || new Date(req.body.timestamp)) || new Date();
    const weightHistory = req.session.userObj.weightHistory;
    const backupUser = JSON.parse(JSON.stringify(req.session.userObj));

    // A litte funky here.
    let position = 0;
    while (position < weightHistory && weightHistory.timeStamp <= timeStamp) {
	position++;
    }

    req.session.userObj.weightHistory.splice(position, 0,{
	weight: values['weight'],
	timestamp: timestamp
    });

    // In the case that our last updated data was
    // before this new one, update the last entered.
    if (new Date(req.session.userObj.lastUpdated) < timestamp) {
	req.session.userObj.lastUpdated = timestamp;
    }

    attemptSave(req, res, redisConn, backupUser);
});

// Weight endpoint [GET]
//
// This is an endpoint for getting weight events
// from the server side to the client. Does so based
// on a range schema: We want all events between
// min and max.
router.get('/api/weight', function(req, res) {
    debugMessage("Recieved a GET on /api/weight.");

    let timeRange = [req.query.min, req.query.max]
	.map((item) => {
	    if (item) {
		return new Date(item);
	    } else {
		return undefined;
	    }
	});

    const minTime = timeRange[0],
	  maxTime = timeRange[1];

    const results = req.session.userObj.weightHistory
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
