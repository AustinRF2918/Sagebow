const debugMessage = require('../utilities/debug.js').debugMessage,
      attemptSave = require('../utilities/database.js').attemptSave,
      express = require('express'),
      router = express.Router(),
      redisConn = require('../configuration.js').REDIS_CONNECTION;

// Consumption Endpoint [POST]
//
// Set a consumption event that has fats, proteins
// carbs, and a name.
router.post('/api/consumption', function(req, res) {
    debugMessage("Recieved a POST on /api/consumption.");

    const values = validateRequest(['fats', 'proteins', 'carbs', 'name'], req, res);

    try {
	const carbs = parseFloat(values['carbs']),
	      fats = parseFloat(values['fats']),
	      proteins = parseFloat(values['proteins']),
	      name = values['name'],
	      timestamp = (req.query.timestamp && new Date(req.query.timestamp))|| new Date();
    } catch(error) {
	res.status(422).send('Malformed');
    }

    // Used in case of failure. Deep copy
    const cachedUser = JSON.parse(JSON.stringify(req.session.userObj));

    // Add entry
    req.session.userObj.nutrientHistory.unshift({
	calories: 4 * carbs + 9 * fats + 4 * proteins,
	carbs: carbs,
	fats: fats,
	proteins: proteins,
	name: name,
	timestamp: timestamp
    });

    try {
	attemptSave(req, res, redisConn, cachedUser);
    } catch(error) {
	// Some error happened with the connection to the database.
	res.sendStatus(200);
	res.status(500).send('Error');
    }
});

// Consumption Endpoint [GET]
//
// Gets a list of all consumptions from a 
// given time span.
router.get('/api/consumption', function(req, res) {
    debugMessage("Recieved a GET on /api/consumption.");

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

    const results = req.session.userObj.nutrientHistory
	    .filter((event) => {
	    if (!minTime || minTime <= new Date(event.timestamp)) {
		// If we do not have a minimum time entered OR the weight
		// event is in range of the weight event time stamp, check
		// the upperbound
		if (!maxTime || maxTime >= new Date(event.timestamp)) {
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
