/*globals $, validateRequired*/
var DEBUG = true;
console.log(`Setting DEBUG to ${DEBUG} in login/app.js.`);

var LoginView = Backbone.View.extend({
    // The tag that represents the
    // hook that this view is associated
    // with.
    el: $("body"),

    // UI Components.
    $username: undefined,
    $password: undefined,

    // Models.
    userFields: undefined,

    initialize: function(attrs) {
	if (DEBUG) {
	    console.log("[login/app.js::LoginView::initialize]: Initializing object...");
	}

	this.el = this.options.applicationContainer;
	this.options = attrs;

	// The user model that will be passed back and
	// fourth between the server.
	this.userFields = this.options.user;

	this.$username = this.options.$username;
	this.$password = this.options.$password;

	_.bindAll(this, 'render');
	this.render();
	
	var that = this;

	$(this.el).find(".btn-login").click(function(event) {
	    that.attemptLogin(event);
	});

	$(this.el).keypress(function(event) {
	    console.log($('body').has('.window'));
	    if (event.which === 13 ) {
		if (($('body').has('.window').length == 0)) {
		    that.attemptLogin(event);
		} else {
		    if (($(".top-text").has('.success-text').length === 0)) {
			$(".modal").parent().remove();
		    } 
		}
	    } 
	});
    },

    validateRequired: function() {
	var inputsSatisfied = $(this.el)
	    .find('.required')
	    .filter(function(element, item) {
		return item.value === '';
	}).length === 0;

	var selectionsSatisfied = $(this.el).children('.btn.required[set=false]').length === 0;

	return inputsSatisfied && selectionsSatisfied;
    },

    events: {
	"click .btn-login": "attemptLogin",
	"keyup .form-control": "attemptLogin"
    },

    getFields: function() {
	return {
	    username: this.$username.val(),
	    password: this.$password.val()
	}
    },

    attemptLogin: function(event) {
	// DEBUG DISPLAY: TO BE REMOVED IN PRODUCTION BUILD
	if (DEBUG) {
	    console.log(`[setup/app.js::SetupView::attemptCreation]: Potential login event...`);
	}
	// !DEBUG DISPLAY


	if (event.keyCode && event.keyCode !== 13 ) {
	    return;
	} else {
	    $(this.el).find(".form-control").blur();
	}

	var that = this;

	if (this.validateRequired()) {
	    // DEBUG DISPLAY: TO BE REMOVED IN PRODUCTION BUILD
	    if (DEBUG) {
		console.log(`[setup/app.js::SetupView::attemptCreation]: Validation passed!...`);
		console.log(this.getFields());
	    }

	    var fields = that.getFields();
	    // !DEBUG DISPLAY
	    console.log(fields);
	    that.userFields.save(fields, {
		
		dataType: 'text',

		success: function(model, response) {
		    // DEBUG DISPLAY: TO BE REMOVED IN PRODUCTION BUILD
		    if (DEBUG) {
			console.log(`[setup/app.js::SetupView::attemptCreation]: Success!...`);
		    }
		    // !DEBUG DISPLAY
		    window.location.pathname = '/entry';
		},

		error: function(model, response) {
		    // DEBUG DISPLAY: TO BE REMOVED IN PRODUCTION BUILD
		    if (DEBUG) {
			console.log(`[setup/app.js::SetupView::attemptCreation]: Error!...`);
		    }
		    // !DEBUG DISPLAY

		    console.log(response.responseText);

		    if (response.responseText === "Not Found") {
			produceModal("Oops", "This username does not exist.", true).display($(that.el));
		    } else if (response.responseText === "Malformed") {
			produceModal("Oops", "The password you entered is incorrect.", true).display($(that.el));

		    } else if (response.responseText === "Error") {
			produceModal("Oops", "We experienced an error and couldn\'t log you in. Try again in a minute.", true).display($(that.el));
		    } else {
			produceModal("Oops", "An unknown error occured, maybe you should try again later.", true).display($(that.el));
		    }
		},
	    });
	} else {
	    produceModal("Oops", "All fields are required.", true).display($(this.el));
	}
    }
});

$(document).ready(function() {
    // Create a user object.
    userObject = new UserModelLogin();

    // Instantiate this page of the application.
    app = new LoginView({
	applicationContainer: $("body"),
	$username: $("#username"),
	$password: $("#password"),
	user: userObject
    });
});
