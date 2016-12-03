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

// Foods  Endpoint [GET]
//
// Gets a list of 5 food events that were most
// recently called.
router.get('/api/foods', function(req, res) {

    // Here is a food list in which we will maintain
    // all of the nutrients we have entered..
    let foodList = [];

    // Loop through each one, check if a name exists AND
    // if it is in our food list already, if the condition
    // is right, add to the list.
    for (const foodEvent of req.session.userObj.nutrientHistory) {
	if (foodEvent.name && !(foodEvent.name in foodList)) {
	    foodList.push(foodEvent.name);
	}
    }

    // Send the first five items.
    res.status(200).send(foodList.slice(0, 5));
});

// Foods  Endpoint [GET]
//
// Performs a search on any food events that
// have been called.
router.get('/api/foods/*', function(req, res) {
    const values = validateRequest(['foodName'], req, res);

    let foodName = decodeURI(req.path.split('/')[3]);

    // If the food name could not be parsed, the
    // request was malformed.
    if (!foodName) {
	res.status(422).send('Malformed');
    }

    // If foodname is in the map of all nutrientHistorys names, send a
    // found status, otherwise it wasn't found.
    if ( foodName in req.session.userObj.nutrientHistory.map( (item) => item.name || undefined )) {
	res.status(200).send(foodEvent);
    } else {
	res.status(404).end('Not Found');
    }
});

module.exports = router;
