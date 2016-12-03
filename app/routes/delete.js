const debugMessage = require("../utilities/debug.js").debugMessage,
      debugEvaluate = require("../utilities/debug.js").debugEvaluate,
      serveFile = require('../utilities/serving.js').serveFile,
      DEBUG = require('../configuration.js').DEBUG,
      express = require('express'),
      router = express.Router(),
      redisConn = require('../configuration.js').REDIS_CONNECTION,
      bcrypt = require('bcryptjs');

// Delete Static Serve
//
// Serves the static markup for the Delete page.
router.get('/delete',function(req,res){
    debugMessage("Recieved a GET on /delete");
    serveFile('delete.html', res);
});

// Delete endpoint
//
// Deletes the current user object and redirects the client
// to the login page.
router.post('/delete', function(req, res) {
    debugMessage("Recieved a POST on /delete");
    debugMessage(`Request body: ${req.body}`);

    const values = validateRequest(['username', 'password'], req, res);

    // Attempt user lookup
    redisConn.get(username, (err, userObj) => {
	userObj = JSON.parse(userObj);

	if (req.body.DEV_UTIL === "hide") {
	    // THIS IS IN THE CASE WE OUR DEBUGGING OUR PROGRAM SO
	    // WE CAN RUN TESTS AND DELETE USERS WITHOUT AUTHENTICATION!!
	    // DELETE THIS IF/WHEN THE APP IS DEPLOYED.
	    debugEvaluate(function() {
		redisConn.del(values['username']);
		res.sendStatus(200);
	    });
	} else if (err) {
	    // Send a 500 internal server error in the
	    // case that some error was thrown on trying
	    // to connect to the Redis database.
	    res.status(500).send('Error');
	} else if (!userObj) {
	    // Send a not found in the case that no user
	    // object is found for the cooresponding username.
	    res.status(404).send('Not Found');
	} else if (!bcrypt.compareSync(values['password'], userObj.passwordHash)) {
	    // Send a malformed in the case that the password
	    // doesn't quite match up.
	    res.status(422).send('Malformed');
	} else {
	    // If none of these cases have happened, create a user object
	    // of the specific client that is attempting to log in and
	    // send a 200 status code.
	    if (req.session.userObj.username === values['username']) {
		redisConn.del(values['username']);
		res.sendStatus(200);
	    } else {
		res.status(422).send('Malformed');
	    }
	}
    });
});

module.exports = router;
