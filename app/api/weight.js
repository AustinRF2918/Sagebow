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

// Weight endpoint [POST]
//
// This is an endpoint for sending over weight updates
// from the client side.
router.post('/api/weight', function(req, res) {
    const neededFields = new Set([
	'value'
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

    const weight = req.body.value;
    let timestamp = req.body.timestamp || new Date();

    // Convert the timestamp object to a date in
    // the case that it is not already one.
    timestamp = new Date(timestamp);

    // This will be used in the case that the following
    // operations fail.
    let oldUserObj = JSON.parse(JSON.stringify(req.session.userObj));

    let position = 0;
    const weightHistory = req.session.userObj.weightHistory;

    while (position < weightHistory && weightHistory.timeStamp <= timeStamp) {
	position++;
    }

    req.session.userObj.weightHistory.splice(position, 0,{
	weight: weight,
	timestamp: timestamp
    });

    // In the case that our last updated data was
    // before this new one, update the last entered.
    if (new Date(req.session.userObj.lastUpdated) < timestamp) {
	req.session.userObj.lastUpdated = timestamp;
    }

    // Attempt save into our redisConn.
    attemptSave(req, res, redisConn, oldUserObj);
});

// Weight endpoint [GET]
//
// This is an endpoint for getting weight events
// from the server side to the client. Does so based
// on a range schema: We want all events between
// min and max.
router.get('/api/weight', function(req, res) {
    let timeRange = [req.query.min, req.query.max]
	.map((item) => {
	    if (item) {
		return new Date(item);
	    } else {
		return undefined;
	    }
	});

    const [minTime, maxTime] = [timeRange[0], timeRange[1]];

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
