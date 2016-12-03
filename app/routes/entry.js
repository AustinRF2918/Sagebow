const serveFile = require('../utilities/serving.js').serveFile,
      debugMessage = require('../utilities/debug.js').debugMessage,
      express = require('express'),
      router = express.Router();

//
// TODO: SEPERATE OUT!!
const redisConn = require('redis').createClient(),
      bcrypt = require('bcryptjs');
//
//

// Entry Static Serve
//
// Serves the static markup for the setup page.
router.get('/entry', function(req, res) {
    debugMessage("Recieved a GET on /entry");
    serveFile('entry.html', res);
});

module.exports = router;
