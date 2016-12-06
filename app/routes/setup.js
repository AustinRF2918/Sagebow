const serveFile = require('../utilities/serving.js').serveFile,
    validateRequest = require('../utilities/integrity.js').validateRequest,
    debugMessage = require('../utilities/debug.js').debugMessage,
    express = require('express'),
    router = express.Router(),
    redisConn = require('../configuration.js').REDIS_CONNECTION,
    bcrypt = require('bcryptjs');

// Setup Static Serve
//
// Serves the static markup for the setup page.
router.get('/setup', function(req, res) {
    debugMessage("Recieved a GET on /setup.");
    serveFile('/setup.html', res);
});

// Setup Endpoint
//
// This is served client side by the setup.html file. It handles
// the general creation of user accounts from the server side,
// making sure all the data is sanitized and other good stuff.
router.post('/setup', function(req, res) {
    debugMessage("Recieved a POST on /setup.");
    debugMessage(`Request body: ${JSON.stringify(req.body)}`);

    // Set of needed fields that must be sent to the endpoint
    // by Sagebow's front-end. These roughly coorespond to
    // a user model that we may create later on for more
    // robust handling of user objects.
    const values = validateRequest([
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
    ], req, res);


    // POTENTIAL CANIDATE FOR METHOD EXTRACTION.
    try {
        if (
            values['username'].match(/[0-9a-z]{3,}/i) !== null &&
            values['password'].match(/.{6,}/) !== null &&
            parseFloat(values['weight']) > 0 &&
            parseFloat(values['bmi']) > 0 &&
            parseFloat(values['dailyCalories'] > 0)) {
            res.status(422).send('Malformed');
        }
    } catch (e) {
        debugMessage("Malformed data was sent to the /setup endpoint.");
        res.status(422).send('Malformed');
    }

    const userObj = {
        username: values['username'],
        passwordHash: bcrypt.hashSync(values['password']),
        weightHistory: [{
            weight: values['weight'],
            timestamp: new Date()
        }],
        lastUpdated: new Date(),
        weight: values['weight'],
        bmi: values['bmi'],
        diet: {
            goal: values['goalSelector'],
            dailyCalories: values['dailyCalories']
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
                debugMessage("Got erroneous data on /setup endpoint.");
                res.status(500).send('Error');
                reject(err);
            } else if (reply) {
                // The database found an entry that already exists with
                // this name.
                debugMessage("Got conflict data in setup.js.");
                res.status(409).send('Conflict');
            } else {
                // Continue through the monad.
                resolve();
            }
        });
    }).then(() => {
        // POTENTIAL CANIDATE FOR METHOD EXTRACTION.
        new Promise((resolve, reject) => {
            // Now that all our preconditions are fullfilled, let's try to
            // save our user object into the Redis cache.
            redisConn.set(userObj.username, JSON.stringify(userObj), (err) => {
                if (err) {
                    // Our Redis connection returned an error for some reason
                    // or another.
                    debugMessage("Got error data in setup.js.");
                    res.status(500).send('Error');
                    reject(err);
                } else {
                    // Our Redis connection indicated that our save was successful.
                    debugMessage("Got final success data in setup.js.");
                    res.status(200).send('Success');
                    resolve();
                }
            });
        }).catch(function(err) {
            // Some generic error went wrong in our connection too the Redis cache.
            debugMessage("Got generic error on redis connection.");
            res.status(500).send('Error');
            reject(err);
        });
    });
});

module.exports = router;
