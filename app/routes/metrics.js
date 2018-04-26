const serveFile = require('../utilities/serving.js').serveFile,
    debugMessage = require('../utilities/debug.js').debugMessage,
    express = require('express'),
    router = express.Router();

// Setup Static Serve
//
// Serves the static markup for the setup page.
router.get('/metrics', function(req, res) {
    debugMessage("Recieved a GET on /setup.");
    res.render('metrics');
});

module.exports = router;
