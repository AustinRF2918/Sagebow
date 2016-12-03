const DEBUG = require('../configuration.js').DEBUG;

module.exports = {
    // Acts as a wrapper for easy formatting of debug messages.
    // Gives the formatted time as well as the desired message
    // formatted to standard out.
    debugMessage: function(msg) {
	if (DEBUG) {
	    console.log(`[${new Date()}]: ${msg}`);
	} 
    }
};
