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

    var LoginModel = Backbone.Model.extend({
	defaults: {
	    username: '',
	    password: ''
	},

	url: function() {
	    return '/login';
	}
    })

    loginFields = new LoginModel();

    // Can be thought of as our application controller.
    var LoginView = Backbone.View.extend({
	el: $("body"),
	$username: undefined,
	$password: undefined,

	initialize: function(attrs) {
	    this.options = attrs;

	    this.$username = this.options.$username;
	    this.$password = this.options.$password;

	    _.bindAll(this, 'render');
	    this.render();
	},

	validateRequired: function() {
	    var inputsSatisfied = $(this.el).children('input.required').filter(function(i, element) {
		    return !password.value;
	    }).length === 0;

	    var selectionsSatisfied = $(this.el).children('.btn.required[set=false]').length === 0;

	    return inputsSatisfied && selectionsSatisfied;
	},

	events: {
	    "click .btn-login": "attemptLogin"
	},

	getFields: function() {
	    return {
		username: this.$username.val(),
		password: this.$password.val()
	    }
	},

	attemptLogin: function() {
	    var that = this;

	    var displayWindow = function(modal) {
		$(that.el).append(modal.render().el);
	    };

	    if (this.validateRequired()) {
		loginFields.save(this.getFields(), {
		    error: function(model, response) {
			if (response.responseText === "OK") {
			    // FOR SOME REASON EVEN WHEN RESPONSE IS OK
			    // BACKBONE SEEMS TO THINK THAT AN ERROR TYPE
			    // IS THE RESPONSE!!
			    window.location.pathname = '/entry';
			} else if (response.responseText === "Not Found") {
			    displayWindow(InvalidInformationModal);
			} else {
			    displayWindow(InternalErrorModal);
			}
		    },

		    success: function(model, response) {
			window.location.pathname = '/entry';
		    }
		});
	    } else {
		displayWindow(IncompleteFieldsModal);
	    }
	}
    });

    app = new LoginView({
	$username: $("#username"),
	$password: $("#password")
    });
});
