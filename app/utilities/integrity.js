function validateRequest(fields, req) {
    // A mapping of all required fields onto the request body:
    // in the case that all objects are mapped, the filter
    // later on will create an array of length zero, indicating
    // that all of our data was on the body of the request, otherwise,
    // an error will be indicated.
    const mappedFields = fields
	.map((item) => req.body[item])
	.filter((item) => item === null || item === undefined);

    // Make sure all of our fields were filtered out.
    // Otherwise send a malformed error code.
    if (mappedFields.length !== 0) {
	// Our request did not have all of the neccessary information.
	return null;
    } else {
	// Our request did have all the neccessary information and now
	// will map over it.
	return fields.reduce((total, current) => {
	    total[current] = req.body[current];
	    return total;
	});
    }
}

module.exports = {
    validateRequest
};
