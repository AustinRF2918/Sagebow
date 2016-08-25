/*globals $, validateRequired*/

$(document).ready(function() {
	$(".btn-login").on('click', function() {
		if (validateRequired()) {
			$.post("/delete", {
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
						window.location.pathname = '/setup';
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
