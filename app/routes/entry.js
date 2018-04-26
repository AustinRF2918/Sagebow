const serveFile = require('../utilities/serving.js').serveFile,
    debugMessage = require('../utilities/debug.js').debugMessage,
    express = require('express'),
    router = express.Router();

// Entry Static Serve
//
// Serves the static markup for the setup page.
router.get('/entry', function(req, res) {
    debugMessage("Recieved a GET on /entry");
    res.render('entry');
});

module.exports = router;
