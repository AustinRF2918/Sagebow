const EXPRESS_ROOT = require('../configuration.js').EXPRESS_ROOT;

module.exports = {
    // Serve a static file via an HTTP get method (usually).
    // Requires a few globals and sends back time stamps
    // as well. This file receives global usage across
    // the app.
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
    }
};
