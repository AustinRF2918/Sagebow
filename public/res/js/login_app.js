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

	displayWindow: function(modal) {
	    $(this.el).append(modal.render().el);
	},

	render: function() {
	},
    });

    app = new LoginApplication();
    app.displayWindow(InvalidInformationModal);

	$(".btn-login").on('click', function() {
		if (validateRequired()) {
			$.post("/login", {
				'username': $("#username").val(),
				'password': $("#password").val(),
				'dataType': "json"
			}).done(function(msg) {
				switch (msg) {
					case 'invalid':
						new FingModal('Oh No!', 'The information you have entered is invalid. Check your username and password and try again!', true).show();
						break;
					case 'error':
						new FingModal('Oops...', 'We experienced an error and couldn\'t log you in. Try again in a minute.', true).show();
						break;
					case 'success':
						window.location.pathname = '/entry';
				}
			});
		}else{
			new FingModal('Oh No!','All fields are required',true).show();
		}
	});

	$("input").keydown(function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
		}
	});
});
