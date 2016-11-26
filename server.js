module.exports = function(EXPRESS_PORT, EXPRESS_ROOT) {
    // Used modules
    var app = require('express')(),
        bodyParser = require('body-parser'),
        session = require('express-session'),
        request = require('request');

    // var fs = require('fs');
    var redisConn = require('redis').createClient();
    var bcrypt = require('bcryptjs');

    // Application Configuration
    var appPort = 4001;

    // Express modules
    // app.use(require('connect-livereload')({
    //     port:EXPRESS_PORT
    // }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(session({
        secret: require('hat')(),
        resave: false,
        saveUninitialized: false
    }));

    //Helper functions described in server/helper.js.
    var serveFile = require('./server/helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;
    var attemptSave = require('./server/helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).attemptSave;
    var responseGenerator = require('./server/ajResponse.js');
    
    app.all('*',function(req,res,next){
        next();
    });

    // Public Routes
    // 
    // All of the following routes are public. This means
    // that they do not require a user object to be created
    // and authenticated to view.
    app.get(/^\/res\/.+/, function(req, res) {
        serveFile(req.url.match('[^?#]+')[0], res);
    });

    // Login Static Serve
    //
    // Serves the static markup for the login page.

    app.get('/login', function(req, res) {
        serveFile('/login.html', res);
    });

    // Setup Endpoint
    //
    // The simple login to our page. Just attempts to create a user
    // object in the case that a hashed password was found.
    app.post(/^\/login$/, function(req, res) {
	const neededFields = new Set([
	    'username',
            'password'
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

	// Trim the the now known to be filled
	// username and passwords portions of
	// the body and set it equal to the
	// respective variables
        const username = req.body.username.trim();
        const password = req.body.password.trim();


	// Attempt to retrieve a username from the redis
	// cache: this may have multiple outcomes.
        redisConn.get(username, (err, userObj) => {
            userObj = JSON.parse(userObj);

            if (err) {
		// Send a 500 internal server error in the
		// case that some error was thrown on trying
		// to connect to the Redis database.
		res.status(500).send('Error');
	    } else if (!userObj) {
		// Send a not found in the case that no user
		// object is found for the cooresponding username.
		res.status(404).send('Not Found');
	    } else if (!bcrypt.compareSync(password, userObj.passwordHash)) {
		// Send a malformed in the case that the password
		// doesn't quite match up.
		res.status(422).send('Malformed');
	    } else {
		// If none of these cases have happened, create a user object
		// of the specific client that is attempting to log in and
		// send a 200 status code.
                req.session.userObj = userObj;
                res.sendStatus(200);
            }
        });
    });

    // Setup Static Serve
    //
    // Serves the static markup for the Setup page.

    app.get('/setup', function(req, res) {
        serveFile('/setup.html', res);
    });


    // Setup Endpoint
    //
    // This is served client side by the setup.html file. It handles
    // the general creation of user accounts from the server side,
    // making sure all the data is sanitized and other good stuff.

    app.post(/^\/setup$/, function(req, res) {
	// Set of needed fields that must be sent to the endpoint
	// by Sagebow's front-end. These roughly coorespond to
	// a user model that we may create later on for more
	// robust handling of user objects.
	const neededFields = new Set([
	    'username',
            'password',
            'weight',
            'height',
            'age',
            'bmi',
            'bmr',
            'activitySelector',
            'goalSelector',
            'genderSelector',
            'dailyCalories'
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


	// A fairly sophisticated check upon all of the data that
	// is required in our request body. In the case that a
	// regex doesn't pass, we will send a malformed code.

	// POTENTIAL CANIDATE FOR METHOD EXTRACTION.
	try {
	    if (
		req.body.username.toString().match(/[0-9a-z]{3,}/i) !== null &&
		req.body.password.toString().match(/.{6,}/) !== null &&
		parseFloat(req.body.weight) > 0 &&
		parseFloat(req.body.bmi) > 0 &&
		parseFloat(req.body.dailyCalories > 0)) {
		    res.status(422).send('Malformed');
		    return;
	    }
	} catch(e) {
	    res.status(422).send('Malformed');
	    return;
	}

	const userObj = {
	    username: req.body.username,
	    passwordHash: bcrypt.hashSync(req.body.password),
	    weightHistory: [{
		weight: req.body.weight,
		timestamp: new Date()
	    }],
	    weight: req.body.weight,
	    lastUpdated: new Date(),
	    bmi: req.body.bmi,
	    diet:{
		goal:req.body.goal,
		dailyCalories:req.body.dailyCalories
	    },
	    nutrientHistory: []
	};

	// POTENTIAL CANIDATE FOR METHOD EXTRACTION.
	// Here we create a promise object that will first attempt
	// a connection on our Redis cache, and following this will
	// attempt to save the user object.
	new Promise((resolve, reject) => {
	    // First, we must vertify that a user does not exist in
	    // our database.
	    redisConn.get(userObj.username, (err, reply) => {
		if (err) {
		    // Some error happened while we where querying the
		    // cache.
		    res.status(500).send('Error');
		    reject(err);
		} else if (reply) {
		    // A reply was found, meaning that a user object
		    // already exists with this primary key.
		    console.log('A user attempted to place a username that already exists.');
		    res.status(409).send('Conflict');
		} else {
		    resolve();
		}
	    })
	}).then(() => {
	    // POTENTIAL CANIDATE FOR METHOD EXTRACTION.
	    new Promise((resolve, reject) => {
		// Now that all our preconditions are fullfilled, let's try to
		// save our user object into the Redis cache.
		redisConn.set(userObj.username, JSON.stringify(userObj), (err) => {
		    if (err) {
			// Our Redis connection returned an error.
			res.status(500).send('Error');
			reject(err);
		    } else {
			// Our Redis connection indicated that our save was successful.
			res.status(200).send('Success');
			resolve();
		    }
		});
	    }).catch(function(err) {
		// Some generic error went wrong in our connection too the Redis cache.
		res.status(500).send('Error');
		reject(err);
	    });
	});
    });

    // End of public routes.

    // PRIVATE ROUTES

    // * path
    //
    // In the case that neither login or setup were called, we use
    // this wildstar pattern to check for the existance of a user
    // session object.
    app.get('*', function(req, res, next) {
        if (req.session.userObj) {
	    // In the case that our session contains a user object,
	    // continue on to the next routes.
            next();
        } else {
	    // Otherwise, signify that the user must login by redirecting
	    // to the login page.
	    to the login page.
            res.redirect('/login');
        }
    });

    // Logout/Login endpoint
    //
    // This is a simple "endpoint", though not exactly an endpoint. 
    // It deletes the current user object and redirects the client
    // to the login page.
    app.get(/^\/log(out|off)$/,function(req,res){
        delete req.session.userObj;
        res.redirect('/login');
    });
    
    // Setup Static Serve
    //
    // Serves the static markup for the Delete page.
    app.get('/delete',function(req,res){
        serveFile('delete.html',res);
    });

    // Delete endpoint
    //
    // This is a simple "endpoint", though not exactly an endpoint. 
    // It deletes the current user object and redirects the client
    // to the login page.
    app.post('/delete', function(req, res) {
	const neededFields = new Set([
	    'username',
            'password'
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

        const username = req.body.username.trim();
        const password = req.body.password.trim();

        // Attempt user lookup
	redisConn.get(username, (err, userObj) => {
            userObj = JSON.parse(userObj);

            if (err) {
		// Send a 500 internal server error in the
		// case that some error was thrown on trying
		// to connect to the Redis database.
		res.status(500).send('Error');
	    } else if (!userObj) {
		// Send a not found in the case that no user
		// object is found for the cooresponding username.
		res.status(404).send('Not Found');
	    } else if (!bcrypt.compareSync(password, userObj.passwordHash)) {
		// Send a malformed in the case that the password
		// doesn't quite match up.
		res.status(422).send('Malformed');
	    } else {
		// If none of these cases have happened, create a user object
		// of the specific client that is attempting to log in and
		// send a 200 status code.
                redisConn.del(username);
                res.sendStatus(200);
            }
        });
    });

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

    // Add consumption event
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
	    return;
	}

	// Set our data equal to the request body which we have
	// ensured exists.
        let carbs = req.query.carbs,
	      fats = req.query.fats,
	      proteins = req.query.proteins,
	      name = req.query.name,
              timestamp = req.query.timestamp || new Date();

	// Attempt to parse all of the data: It is possible
	// that we got sent bad data.
	try {
	    timestamp = new Date(timestamp);
	    carbs = parseFloat(carbs);
	    fats = parseFloat(fats);
	    proteins = parseFloat(proteins);
	} catch(error) {
	    // The data was in some way unparseable. Therefore,
	    // it was malformed.
	    res.status(422).send('Malformed');
	}

	// Used in case of failure. Deep copy
	const oldUserObj = JSON.parse(JSON.stringify(req.session.userObj));

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
	    attemptSave(req, res, redisConn, oldUserObj);
	} catch(error) {
	    // Some error happened with the connection to the database.
	    res.sendStatus(200);
	    res.status(500).send('Error');
	}
    });

    app.get('/api/consumption', function(req, res) {
        var minTime = req.query.min,
            maxTime = req.query.max;

        // Format as dates
        if (minTime) {
            minTime = new Date(minTime);
        }
        if (maxTime) {
            maxTime = new Date(maxTime);
        }

        var results = req.session.userObj.nutrientHistory.filter(function(consumptionEvent) {
            if (!minTime || minTime <= new Date(consumptionEvent.timestamp)) {
                // no min time or within range
                if (!maxTime || maxTime >= new Date(consumptionEvent.timestamp)) {
                    // no max time or within range
                    return true;
                }
            }
            return false;
        });

        res.status(200).send(results);
    });

    // Get food name history
    app.get('/api/foods', function(req, res) {
        var foodDict = {};
        for (var foodEvent of req.session.userObj.nutrientHistory) {
            if (foodEvent.name && !foodDict[foodEvent.name]) {
                foodDict[foodEvent.name] = true;
            }
        }
        res.status(200).send(Object.keys(foodDict).slice(0,5));
    });
    app.get('/api/foods/*', function(req, res) {
        var foodName = decodeURI(req.path.split('/')[3]);
        if (!foodName) {
            res.status(400).send('need a food name');
        }
        else {
            var found = false;
            for (var foodEvent of req.session.userObj.nutrientHistory) {
                if (foodEvent.name === foodName) {
                    res.status(200).send(foodEvent);
                    found = true;
                    break;
                }
            }
            if(!found){
                res.status(404).end('Could not find food: '+foodName);
            }
        }
    });
    
    // Query NDB
    app.get('/api/query/:name',function(req,res){
        var apiKey = 'DJJzSXqqAhl30URUOtKfmsZJkEZESNEqiKg58CxC';
        // Find food dbnum
        new Promise(function(resolve,reject){
            var url = 'http://api.nal.usda.gov/ndb/search/?format=json&q='+req.params.name+'&max=1&api_key=' + apiKey;
            request(url,function(err,response,body){
                if(err || response.statusCode !== 200){
                    console.error(err);
                    console.error(response);
                    reject();
                }else{
                    resolve(JSON.parse(body).list.item[0].ndbno);
                }
            });
        }).then(function(dbnum){
            return new Promise(function(resolve,reject){
                var url = 'http://api.nal.usda.gov/ndb/reports/?ndbno='+dbnum+'&type=s&format=json&api_key='+apiKey;
                request(url,function(err,response,body){
                    if(err || response.statusCode !== 200){
                        console.error(response);
                        reject(err);
                    }else{
                        var foodData = {},
                            nutrients = JSON.parse(body).report.food.nutrients;
                        // Find the nutrients we are interested in
                        for(var nutrient of nutrients){
                            if(nutrient.nutrient_id == 203){
                                foodData.proteins = nutrient.value;
                            }
                            if(nutrient.nutrient_id == 204){
                                foodData.fats = nutrient.value;
                            }
                            if(nutrient.nutrient_id == 205){
                                foodData.carbs = nutrient.value;
                            }
                        }
                        resolve(foodData);
                    }
                });
            });
        }).then(function(foodData){
            res.send(foodData);
        }).catch(function(err){
            console.error('query failure');
            console.error(err);
            res.status(400).end('Unable to perform request');
        });
    });

    app.listen(appPort);
};
