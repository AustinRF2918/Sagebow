const DEBUG = require('./configuration.js').DEBUG,
      EXPRESS_PORT = require('./configuration.js').EXPRESS_PORT,
      EXPRESS_ROOT = require('./configuration.js').EXPRESS_ROOT;

module.exports = {
    // Serves a file.
    serveFile: function (uri, res) {
	res.set('Content-Type', 'text/html');
	res.sendFile(uri, {
	    root: EXPRESS_ROOT,
	    dotfiles: 'allow',
	    headers: {
		'x-timestamp': Date.now(),
		'x-sent': true
	    }
	});
    },


    // Attempts to save a user object. In the case this is
    // not possible, falls back on a deep copy.
    attemptSave: function ( req, res, redisConn, fallback ) {
	redisConn.set(
	    req.session.userObj.username,
	    JSON.stringify(req.session.userObj),
	    function( err ){
		if(err){
		    console.error(err);
		    req.session.userObj = fallback;
		    res.sendStatus(500);
		} else{
		    res.sendStatus(200);
		}
	    }
	);
    },

    // Acts as a wrapper for easy formatting of debug messages.
    debugMessage: function(msg) {
	if (DEBUG) {
	    console.log(`[${new Date()}]: ${msg}`);
	} 
    }
};
