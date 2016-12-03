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
    const neededFields = new Set([
	'foodName'
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

    // Extract the food name from the URI passed.
    let foodName = decodeURI(req.path.split('/')[3]);

    // If the food name could not be parsed, the
    // request was malformed.
    if (!foodName) {
	res.status(422).send('Malformed');
	return;
    }

    // If foodname is in the map of all nutrientHistorys names, send a
    // found status, otherwise it wasn't found.
    if ( foodName in req.session.userObj.nutrientHistory.map( (item) => item.name || undefined )) {
	res.status(200).send(foodEvent);
	return;
    } else {
	res.status(404).end('Not Found');
	return;
    }
});

module.exports = router;
