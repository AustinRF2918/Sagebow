/*globals $, validateRequired*/

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
	this.el = this.options.applicationContainer;
	this.options = attrs;

	// The user model that will be passed back and
	// fourth between the server.
	this.userFields = this.options.user;

	// UI Elements which we will use to
	// enter data.
	this.$username = this.options.$username;
	this.$password = this.options.$password;

	_.bindAll(this, 'render');
	this.render();
	
	var that = this;

	$(this.el).find(".btn-login").click(function(event) {
	    $(".btn-login").blur();
	    that.attemptLogin(event);
	});

	$(document).keypress(function(event) {
	    if (event.which === 13 ) {
		if (($('body').has('.window').length == 0)) {
		    that.attemptLogin(event);
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

    getFields: function() {
	return {
	    username: this.$username.val(),
	    password: this.$password.val()
	}
    },

    attemptLogin: function(event) {
	if (!this.validateRequired()) {
	    produceModal("Oops", "All fields are required.", true).display($(this.el));
	    return false;
	}

	var fields = this.getFields();
	var that = this;

	this.userFields.save(fields, {
	    dataType: 'text',

	    success: function(model, response) {
		window.location.pathname = '/entry';
		return false;
	    },

	    error: function(model, response) {
		if (response.responseText === "Not Found") {
		    produceModal("Oops", "This username does not exist.", true).display($(that.el));
		} else if (response.responseText === "Malformed") {
		    produceModal("Oops", "The password you entered is incorrect.", true).display($(that.el));

		} else if (response.responseText === "Error") {
		    produceModal("Oops", "We experienced an error and couldn\'t log you in. Try again in a minute.", true).display($(that.el));
		} else {
		    produceModal("Oops", "An unknown error occured, maybe you should try again later.", true).display($(that.el));
		}

		return true;
	    },
	});
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
