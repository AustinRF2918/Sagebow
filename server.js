module.exports = function(EXPRESS_PORT, EXPRESS_ROOT) {
    // Used modules
    const app = require('express')(),
        bodyParser = require('body-parser'),
        session = require('express-session'),
	request = require('request'),
	redisConn = require('redis').createClient(),
	bcrypt = require('bcryptjs');

    // Application Configuration
    const APP_PORT = 4001;

    // API Key for the USDA API.
    const API_KEY = 'DJJzSXqqAhl30URUOtKfmsZJkEZESNEqiKg58CxC';


    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(session({
        secret: require('hat')(),
        resave: false,
        saveUninitialized: false
    }));

    const router = require('./app/router.js')(app);

    //Helper functions described in server/helper.js.
    const serveFile = require('./app/helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;
    const attemptSave = require('./app/helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).attemptSave;
    
    // End of public routes.

    // PRIVATE ROUTES

    // Metrics Static Serve
    //
    // Serves the static markup for the Metrics page.
    app.get('/metrics', function(req, res) {
        serveFile('metrics.html', res);
    });

    // Entry Static Serve
    //
    // Serves the static markup for the Entry page.
    app.get('/entry', function(req, res) {
        serveFile('entry.html', res);
    });

    // PRIVATE API

    // Diet endpoint
    //
    // This is an endpoint for sending over diet information
    // from the client side.
    app.get('/api/diet',function(req, res) {
        res.status(200).send(req.session.userObj.diet);
    });
    
    // Weight endpoint [POST]
    //
    // This is an endpoint for sending over weight updates
    // from the client side.
    app.post('/api/weight', function(req, res) {
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
    app.get('/api/weight', function(req, res) {
        let timeRange = [req.query.min, req.query.max]
	    .map((item) => {
		if (item) {
		    return new Date(item)
		} else {
		    return undefined
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

    // Last Updated Endpoint [GET]
    //
    // This is an endpoint for getting the last update
    // on our client object.
    app.get('/api/lastUpdated',function(req, res) {
        res.status(200).send(req.session.userObj.lastUpdated);
    });
    
    // Last Updated At Date Endpoint [GET]
    //
    // Gets the last update at a date.
    // on our client object.
    // May not be used?
    // DEAD CODE.
    app.get('/api/lastUpdated/:date',function(req,res){
	const neededFields = new Set([
	    'date'
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

	// Attempt to create a date object from the URI passed into req.params.date.
	// In the case that it is not possible, the data is malformed.
	try {
	    req.session.userObj.lastUpdated = new Date(decodeURI(req.params.date));
	} catch(error) {
	    res.status(422).send('Malformed');
	    return;
	}

	// Attempt to save into the database.
	try {
	    attemptSave(req, res, redisConn, req.session.userObj);
	    res.sendStatus(200);
	    return;
	} catch(error) {
	    res.status(500).send('Error');
	    return;
	}
    });

    // Consumption Endpoint [POST]
    //
    // Set a consumption event that has fats, proteins
    // carbs, and a name.
    app.post('/api/consumption', function(req, res) {
	const neededFields = new Set([
	    'fats',
	    'proteins',
	    'carbs',
	    'name'
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
	}

	// Set our data equal to the request body which we have
	// ensured exists.
	try {
	    const carbs = parseFloat(req.query.carbs),
		  fats = parseFloat(req.query.fats),
		  proteins = parseFloat(req.query.proteins),
		  name = req.query.name,
		  timestamp = (req.query.timestamp && new Date(req.query.timestamp))|| new Date();
	} catch(error) {
	    // The data was in some way unparseable. Therefore,
	    // it was malformed.
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
    app.get('/api/consumption', function(req, res) {
	let timeRange = [req.query.min, req.query.max]
	    .map((item) => {
		if (item) {
		    return new Date(item)
		} else {
		    return undefined
		}
	    });

	const [minTime, maxTime] = [timeRange[0], timeRange[1]];

        const results = req.session.userObj.nutrientHistory
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

    // Foods  Endpoint [GET]
    //
    // Gets a list of 5 food events that were most
    // recently called.
    app.get('/api/foods', function(req, res) {

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
    app.get('/api/foods/*', function(req, res) {
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
    
    // Query  Endpoint [GET]
    //
    // This is a proxy for the national
    // food database: we place in a specific
    // food name and see if it exists in
    // the governments API.
    app.get('/api/query/:name',function(req, res){
	console.log("Recieved a GET on /api/query/:name.");

	// Utilizing a promise monad, we sequentially access the
	// api for the usda and get nutritional information back to the client.
        new Promise( (resolve, reject) => {
            const url = `http://api.nal.usda.gov/ndb/search/?format=json&q=${req.params.name}&max=1&api_key=${API_KEY}`;

            request(url, (err, response, body) => {
                if (err || response.statusCode !== 200) {
		    res.status(400).end('Unable to perform request');
                } else {
		    // Set the then to have a single parameter (promise pattern).
                    resolve(JSON.parse(body).list.item[0].ndbno);
                }
            });
        }).then( (databaseNumber) => {
	    const url = `http://api.nal.usda.gov/ndb/reports/?ndbno=${databaseNumber}&type=s&format=json&api_key=${API_KEY}`;

	    request(url, function(err, response, body) {
		if (err || response.statusCode !== 200) {
		    res.status(400).end('Unable to perform request');
		} else {
		    let foodData = {};
		    const nutrients = JSON.parse(body).report.food.nutrients;

		    // Find the nutrients we are interested in
		    // Make this a method.
		    for (let nutrient of nutrients){
			if (nutrient.nutrient_id == 203){
			    foodData.proteins = nutrient.value;
			} else if (nutrient.nutrient_id == 204){
			    foodData.fats = nutrient.value;
			} else if(nutrient.nutrient_id == 205){
			    foodData.carbs = nutrient.value;
			}
		    }

		    res.send(foodData);
		}
	    });
        });
    });

    app.listen(APP_PORT);
};
