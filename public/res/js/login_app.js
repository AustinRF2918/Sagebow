/*globals $, validateRequired*/

$(document).ready(function() {
    var InvalidInformationModal = new ModalView({
	header: "Opps",
	message: "The information you have entered is invalid. Check your username and password and try again!",
	isDangerous: true
    });

    var InternalErrorModal = new ModalView({
	header: "Oops",
	message: "We experienced an error and couldn\'t log you in. Try again in a minute.",
	isDangerous: true
    });

    var IncompleteFieldsModal = new ModalView({
	header: "Oops",
	message: "All fields are required.",
	isDangerous: true
    });


    // Can be thought of as our application controller.
    var LoginApplication = Backbone.View.extend({
	el: $("body"),

	initialize: function() {
	    _.bindAll(this, 'render');
	    this.render();
	},

	events: {
	    "click .btn-login": "attemptLogin"
	},

	attemptLogin: function() {
	    var that = this;

	    var displayWindow = function(modal) {
		$(that.el).append(modal.render().el);
	    };

	    if (validateRequired()) {
		$.post("/login", {
		    'username': $("#username").val(),
		    'password': $("#password").val(),
		    'dataType': "json"
		}).done( function(msg) {
		    switch (msg) {
			case 'invalid':
			    displayWindow(InvalidInformationModal);
			    break;
			case 'error':
			    displayWindow(InternalErrorModal);
			    break;
			case 'success':
			    window.location.pathname = '/entry';
		    }
		});
	    } else {
		displayWindow(IncompleteFieldsModal);
	    }
	}
    });

    app = new LoginApplication();
});
