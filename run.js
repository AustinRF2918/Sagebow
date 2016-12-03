const EXPRESS_PORT = require('./app/configuration.js').EXPRESS_PORT;
const debugMessage = require("./app/utilities/debug.js").debugMessage;

debugMessage("Starting Sagebow server...");
require('./app/app.js')(process.env.PORT, __dirname + '/public');
debugMessage("Waiting for requests...");
