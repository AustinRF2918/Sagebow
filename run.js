const debugMessage = require("./app/utilities/debug.js").debugMessage;

debugMessage("Starting Sagebow server...");
require('./app/app.js')();
debugMessage("Waiting for requests...");
