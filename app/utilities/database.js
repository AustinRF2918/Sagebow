const debugMessage = require('./debug.js').debugMessage;

module.exports = {
    // Attempts to save a user object. In the case this is
    // not possible, falls back on a deep copy. Also displays
    // generic messages via error module in the case an
    // error does in fact occur.
    attemptSave: function(req, res, redisConn, fallback) {
	redisConn.set(
	    req.session.userObj.username,
	    JSON.stringify(req.session.userObj),
	    function(err) {
		if (err) {
		    debugMessage(err);
		    debugMessage("Falling back on user object!.");
		    req.session.userObj = fallback;
		    res.sendStatus(500);
		} else {
		    res.sendStatus(200);
		}
	    }
	);
    }
};
