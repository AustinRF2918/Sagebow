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
    var appPort = EXPRESS_PORT;

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

            if (err)
                res.send('error');
            else if (!userObj)
                res.send('invalid');
            else if (!bcrypt.compareSync(password, userObj.passwordHash))
                res.send('invalid');
            else {
                // Grant access!
                console.log('granting access');
                req.session.userObj = userObj;
                res.send('success');
            }
        });
    });

    // Post setup
    app.post(/^\/setup$/, function(req, res) {
        // Check fields are present
        var neededFields = [
            'username',
            'password',
            'weight',
            'bmi',
            'dailyCalories'
        ];
        var fieldsPresent = true;
        for (var field of neededFields) {
            if (!req.body[field]) {
                fieldsPresent = false;
                break;
            }
        }
        if (fieldsPresent) {
            // verify integrity
            if (
                req.body.username.match(/[0-9a-z]{3,}/i) &&
                req.body.password.match(/.{6,}/) &&
                req.body.weight.match(/[0-9]+/) &&
                parseFloat(req.body.weight) > 0 &&
                req.body.bmi.match(/[0-9]+/) &&
                parseFloat(req.body.bmi) > 0 &&
                req.body.dailyCalories.match(/[0-9]*/) &&
                parseFloat(req.body.dailyCalories) > 0
            ) {

                // Hash password
                var passwordHash = bcrypt.hashSync(req.body.password);
                // Construct user object
                var userObj = {
                    username: req.body.username,
                    passwordHash: passwordHash,
                    weightHistory: [{
                        weight: req.body.weight,
                        timestamp: new Date()
                    }],
                    weight: req.body.weight,
                    lastUpdated: new Date(),
                    bmi: req.body.bmi,
                    dietPlan: {
                        weightGoal: req.body.weightGoal,
                        dailyCalories: req.body.dailyCalories
                    },
                    nutrientHistory: []
                };
                // Save and redirect to login
                new Promise(function(resolve, reject) {
                    // Verify user doesn't exist
                    redisConn.get(userObj.username, function(err, reply) {
                        if (err) {
                            res.status(200).send('error');
                            reject(err);
                        }
                        else {
                            if (reply) {
                                console.log('username exists. Cant setup');
                                res.status(200).send('exists');
                            }
                            else {
                                resolve();
                            }
                        }
                    });
                }).then(function() {
                    return new Promise(function(resolve, reject) {
                        // attempt to save
                        redisConn.set(userObj.username, JSON.stringify(userObj), function(err) {
                            if (err) {
                                // save failed
                                res.status(200).send('error');
                                reject(err);
                            }
                            else {
                                // save successful!
                                res.status(200).send('success');
                                resolve();
                            }
                        });
                    });
                }).catch(function(err) {
                    console.error(err);
                });
            }
            else {
                res.status(200).send('malformed');
                console.log('malformed data');
            }
        }
        else {
            // Missing fields
            res.status(200).send('incomplete');
        }
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
        res.status(200).end();
    });

    app.get('/metrics', function(req, res) {
        serveFile('metrics.html', res);
    });

    app.get('/entry', function(req, res) {
        serveFile('entry.html', res);
    });

    // PRIVATE API
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
        var carb = req.query.carbs,
            fat = req.query.fats,
            protein = req.query.proteins,
            name = req.query.name,
            timestamp = req.query.timestamp || new Date();
        console.log(req.query);

        // Validate fields
        if (!carb || !fat || !protein) {
            res.status(400).send('Missing required calorie params');
        }
        else {
            // Formatting
            timestamp = new Date(timestamp);
            carb = parseFloat(carb);
            fat = parseFloat(fat);
            protein = parseFloat(protein);

            // Used in case of failure. Deep copy
            var oldUserObj = JSON.parse(JSON.stringify(req.session.userObj));

            // Add entry
            req.session.userObj.nutrientHistory.unshift({
                calories: 4 * carb + 9 * fat + 4 * protein,
                carb: carb,
                fat: fat,
                protein: protein,
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
