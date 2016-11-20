/*globals $, validateRequired*/

$(document).ready(function() {
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
	    if (event.keyCode && event.keyCode !== 13 ) {
		return;
	    } else {
		$(this.el).find(".form-control").blur();
	    }

	    var that = this;

	    var displayWindow = function(modal) {
		$.when($(that.el).append(modal.render().el)).then(function() {
		    setTimeout(function(){
			$(that.el).find(".begin-transparent").removeClass('begin-transparent');
		    }, 50);
		});
	    };

	    if (this.validateRequired()) {
		loginFields.save(this.getFields(), {
		    dataType: 'text',

		    success: function(model, response) {
			window.location.pathname = '/entry';
		    },

		    error: function(model, response) {
			if (response.responseText === "Not Found") {
			    var notFoundModal = produceModal("Oops", "The information you have entered is invalid. Check your username and password and try again!", true);
			    displayWindow(notFoundModal);
			} else {
			    var internalErrorModal = produceModal("Oops", "We experienced an error and couldn\'t log you in. Try again in a minute.", true);
			    displayWindow(internalErrorModal);
			}
		    },
		});
	    } else {
		var incompleteFieldsModal = produceModal("Oops", "All fields are required.", true);
		displayWindow(incompleteFieldsModal);
	    }
	}
    });

    app = new LoginView({
	$username: $("#username"),
	$password: $("#password")
    });
});
