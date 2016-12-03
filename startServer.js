console.log("Starting Sagebow server...");
require('./server.js')(process.env.PORT, __dirname + '/public');
console.log("Waiting for requests...");
