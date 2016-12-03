const EXPRESS_PORT = require('./app/configuration.js').EXPRESS_PORT;
const debugMessage = require("./app/helpers.js").debugMessage;

debugMessage("Starting Sagebow server...");
require('./server.js')(process.env.PORT, __dirname + '/public');
debugMessage("Waiting for requests...");
