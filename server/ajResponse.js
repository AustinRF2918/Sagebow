/*
* These are generators for response objects that always have
* a specific structure when being sent to the front end: it
* simply logs an error, if one has occured and then generates 
* an object with the attributes of "error code" and "message",
* which are self explanitory
* @function
* @param {number} code - The (approximated) error code that 
* we will be sending.
* @param {string} message - The message that will be sent back.
* @param @optional {Error} err - The optional error that may 
* have been generated
*/
_generateResponseObject =  function ( code, message, err ) {
    if ( err ) {
	console.error( err );
    }

    return {
	code: code,
	message: message
    };
},

/*
 * These are response utility functions that help me
 * automatically generate response messages with a 
 * message a code and then using posts and recieves
 * on JSON data I can handle it from the front end.
 * @module
 */

module.exports = {
    /*
    * This is a generated object for returning error objects.
    * @function
    */
    loginErrorResponse: function() {
	return (function(){
	  return _generateResponseObject ( 500, "Internal Server Error", err);
	})();
    },

    /*
    * This is a generated object for returning not found objects.
    * @function
    */
    userNotFoundResponse: function() { return _generateResponseObject ( 404, "Object Not Found" ); },

    /*
    * This is a generated object for returning invalid password objects.
    * @function
    */
    invalidPasswordResponse: function() { return _generateResponseObject ( 401, "Invalid Password" ); },

    /*
    * This is a function for automating the sending of responses back
    * to the front end.
    * @function
    * @param {Reponse object} res - The response object that will be 
    * sending information to the user
    * @param {JSON} data - The json that will be sent back.
    */
    sendResponseObject: function ( res, data ) {
	res.send(JSON.stringify( data ));
    }
};

