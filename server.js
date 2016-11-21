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
        console.log(req.url);
        next();
    });

    // PUBLIC ROUTES:
    // Public
    app.get(/^\/res\/.+/, function(req, res) {
        serveFile(req.url.match('[^?#]+')[0], res);
    });

    app.get('/login', function(req, res) {
        serveFile('/login.html', res);
    });

    app.get('/setup', function(req, res) {
        serveFile('/setup.html', res);
    });

    // Post Login
    app.post(/^\/login$/, function(req, res) {
        var username = req.body.username.trim();
        var password = req.body.password.trim();

        // Attempt user lookup
        redisConn.get(username, function(err, userObj) {
            userObj = JSON.parse(userObj);

            if (err) {
                res.sendStatus(500);
	    } else if (!userObj) {
                res.sendStatus(404);
	    } else if (!bcrypt.compareSync(password, userObj.passwordHash)) {
                res.sendStatus(422);
	    } else {
                req.session.userObj = userObj;
                res.sendStatus(200);
            }
        });
    });

    // Post setup
    app.post(/^\/setup$/, function(req, res) {
	// Set of needed fields that must be sent to the endpoint
	// by Sagebow's front-end. These roughly coorespond to
	// a user model that we may create later on for more
	// robust handling of user objects.
	let neededFields = new Set([
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
	let fields = Array.from(neededFields.values())
	    .map((item) => req.body[item])
	    .filter((item) => item === null || item === undefined);

	console.log(fields);

        if (fields.length !== 0) {
	    res.status(422).send('Malformed');
	    return;
	}


	// A fairly sophisticated check upon all of the data that
	// is required in our request body. In the case that a
	// regex doesn't pass, we will send a malformed code.
	console.log(req.body.username.toString().match(/[0-9a-z]{3,}/i));
	console.log(req.body.password.toString().match(/.{6,}/));

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

	var userObj = {
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

    // PRIVATE ROUTES
    app.get('*', function(req, res, next) {
        if (req.session.userObj) {
            // Free to proceed
            next();
        }
        else {
            // Login first!
            res.redirect('/login#noAccess');
        }
    });

    app.get(/^\/log(out|off)$/,function(req,res){
        delete req.session.userObj;
        res.redirect('/login');
    });
    
    app.get('/delete',function(req,res){
        serveFile('delete.html',res);
    });
    
    // Post Delete
    app.post('/delete', function(req, res) {
        var username = req.body.username.trim();
        var password = req.body.password.trim();

        // Attempt user lookup
        redisConn.get(username, function(err, userObj) {
            userObj = JSON.parse(userObj);

            if (err)
                res.send('error');
            else if (!userObj)
                res.send('invalid');
            else if (!bcrypt.compareSync(password, userObj.passwordHash))
                res.send('invalid');
            else {
                redisConn.del(username);
                console.log('delete account');
                res.send('success');
            }
        });
    });

    app.get('/metrics', function(req, res) {
        serveFile('metrics.html', res);
    });

    app.get('/entry', function(req, res) {
        serveFile('entry.html', res);
    });

    // PRIVATE API
    // gets the users weight goal
    app.get('/api/diet',function(req,res){
        res.status(200).send(req.session.userObj.diet);
    });
    
    // Add weight event
    app.post('/api/weight', function(req, res) {
        var weight = req.body.value;
        if (!weight) {
            res.status(400).send('Value param expected');
        }
        else {
            var timestamp = req.body.timestamp || new Date();
            // Convert to date
            timestamp = new Date(timestamp);

            // Used in case of failure. Deep copy
            var oldUserObj = JSON.parse(JSON.stringify(req.session.userObj));

            // Add entry
            var i = 0, weightHistory = req.session.userObj.weightHistory;
            while(i < weightHistory && weightHistory.timeStamp <= timeStamp)
                i++;
            req.session.userObj.weightHistory.splice(i,0,{
                weight:weight,
                timestamp:timestamp
            });

            // Update modify date if needed
            if (new Date(req.session.userObj.lastUpdated) < timestamp) {
                req.session.userObj.lastUpdated = timestamp;
            }

            // Attempt to save...
            attemptSave(req, res, redisConn, oldUserObj);
        }
    });
    // Get weight events
    app.get('/api/weight', function(req, res) {
        var minTime = req.query.min,
            maxTime = req.query.max;

        // Format as dates
        if (minTime) {
            minTime = new Date(minTime);
        }
        if (maxTime) {
            maxTime = new Date(maxTime);
        }

        var results = req.session.userObj.weightHistory.filter(function(weightEvent) {
            if (!minTime || minTime <= new Date(weightEvent.timestamp)) {
                // no min time or within range
                if (!maxTime || maxTime >= new Date(weightEvent.timestamp)) {
                    // no max time or within range
                    return true;
                }
            }
            return false;
        });

        res.status(200).send(results);
    });
    
    app.get('/api/lastUpdated',function(req,res){
        res.status(200).send(req.session.userObj.lastUpdated);
    });
    
    app.get('/api/lastUpdated/:date',function(req,res){
        req.session.userObj.lastUpdated = new Date(decodeURI(req.params.date));
        attemptSave(req,res,redisConn,req.session.userObj);
    });

    // Add consumption event
    app.post('/api/consumption', function(req, res) {
        var carbs = req.query.carbs,
            fats = req.query.fats,
            proteins = req.query.proteins,
            name = req.query.name,
            timestamp = req.query.timestamp || new Date();
        console.log(req.query);

        // Validate fields
        if (!carbs || !fats || !proteins) {
            res.status(400).send('Missing required params');
        }
        else {
            // Formatting
            timestamp = new Date(timestamp);
            carbs = parseFloat(carbs);
            fats = parseFloat(fats);
            proteins = parseFloat(proteins);

            // Used in case of failure. Deep copy
            var oldUserObj = JSON.parse(JSON.stringify(req.session.userObj));

            // Add entry
            req.session.userObj.nutrientHistory.unshift({
                calories: 4 * carbs + 9 * fats + 4 * proteins,
                carbs: carbs,
                fats: fats,
                proteins: proteins,
                name: name,
                timestamp: timestamp
            });

            attemptSave(req, res, redisConn, oldUserObj);
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
