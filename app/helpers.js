/*
 * These are server utility functions that are used 
 * to dynamically serve content to the user. They use
 * a routing schema found in routes.js.
 * @module
 * @param {number} EXPRESS_PORT - Some constant number
 * representing a server port number.
 * @param {string} EXPRESS_ROOT - Some root folder toggle
 * use as our root name throughout the application.
 */

module.exports = function( EXPRESS_PORT, EXPRESS_ROOT ) {
    return {
	/*
	* This is a file system helper, it basically works to
	* automatically take a uri, some resource on the server,
	* and a response object and then serve it async to the 
	* user.
	* @function
	* @param {string} URI - Some resource on our server.
	* @param {Response object} - Some thread running to 
	* provide service to a user
	*/
	serveFile: function ( uri, res ) {
	    res.set('Content-Type', 'text/html');
	    res.sendFile( uri, {
		root: EXPRESS_ROOT,
		//NOTE THAT THIS WAS MODIFIED BECAUSE
		//I WAS TRYING TO DO SOMETHING BAD: PLEASE FIX IT :((.
		dotfiles: 'allow',
		headers: {
		    'x-timestamp': Date.now(),
		    'x-sent': true
		}
	    });
	},

	/*
	* This is a data persistance helper, it attempts to do
	* some action onto our database, and it the case that 
	* this is for any reason resulting in an error, will
	* return and handle an error with a callback. (Or in
	* more real terms, utilizing a status sent back to the 
	* user.
	* @function
	* @param {string} URI - Some resource on our server.
	* @param {Response object} - Some thread running to 
	* provide service to a user
	* @param {User object} - some describable fallback
	* object.
	*/
	attemptSave: function ( req, res, redisConn, fallback ) {
	    redisConn.set(
		req.session.userObj.username,
		JSON.stringify(req.session.userObj),
		function( err ){
		    if(err){
			console.error(err);
			req.session.userObj = fallback;
			res.sendStatus(500);
		    } else{
			res.sendStatus(200);
		    }
		}
	    );
	}
    };
};
