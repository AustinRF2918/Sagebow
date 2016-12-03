function checkFields(set, req) {
    // A mapping of all required fields onto the request body:
    // in the case that all objects are mapped, the filter
    // later on will create an array of length zero, indicating
    // that all of our data was on the body of the request, otherwise,
    // an error will be indicated.
    const fields = Array.from(set.values())
	.map((item) => req.body[item])
	.filter((item) => item === null || item === undefined);

    // Make sure all of our fields were filtered out.
    // Otherwise send a malformed error code.
    if (fields.length !== 0) {
	return false;
    } else {
	return true;
    }
}

module.exports = {
    checkFields
};
