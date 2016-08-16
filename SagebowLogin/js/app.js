var authenticateUser = function( username, password ) {
    //Here is where info will be sent to the server
    //I guess to vertify that this username/password
    //indeed exists...

    if (username === "myemail@yahoo.com" && password === "password1") {
	//This user is registered, the server sent back true.
	//MARK USER AS AUTHENTICATED AND ABLE TO GET KEYS.
	return true;
    } else {
	return false;
    }
};

var getUserKey = function( username ) {
    //Here is where I assume a username will be
    //used to get a private key or something via
    //some express magic? I assume it just needs
    //username because password is authenticated.

    //Server: "Oh he's authenticated, it's cool, continue"

    //Hash is now stored locally? (length represents retrived value)
    return username.length;
}

var authenticateForms = function() {
    var emailInput = $("#email-input").val();
    var passwordInput = $("#password-input").val();

    if (authenticateUser(emailInput, passwordInput)){
	return getUserKey(emailInput);
    } else {
	return false;
    }
};

var requestURL = function(){
    return "192.168.1.104:4001:/";
};

$(document).ready(function(){
    $(".btn-login").on('click', function(){
	//General application logic goes here.
	  //Step 1: Send request to server.
	  //Step 2: Response good?
	    //If yes: redirect to next page.
	    //Else...

	var myKey = authenticateForms();

	//Use falsey value to indicate failure?
	if (!authenticateForms()) {
	  $(".modal-rejected").toggleClass("modal-rejected-hidden");
	} else {
	    alert("You logged in! with the key " + myKey);
	  //Redirect to a newly generated dashboard page.
	}
    });

    $(".btn-reject").on('click', function(){
	$(".modal-rejected").toggleClass("modal-rejected-hidden");
    });
});

