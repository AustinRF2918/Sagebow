const debugMessage = require('./debug.js').debugMessage;

function validateRequest(fields, req, res) {
    // Map all required items to actual request
    // body.
    const mappedFields = fields
	.map((item) => req.body[item] || req.params[item])
	.filter((item) => item === null || item === undefined);

    // Make sure all of our fields were filtered out.
    if (mappedFields.length !== 0) {
	debugMessage("Got malformed data last requested endpoint: ${mappedFields}");
	res.status(422).send('Malformed');
	return null;
    } else {
	// Successful case.
	let values = {};
	fields.map((item) => values[item] = req.body[item] || req.params[item]);
	return values;
    }
};

module.exports = {
    validateRequest
};

