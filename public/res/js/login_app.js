/*globals $*/
var checkInput = function(modalSelector, $emailSelector, $passwordSelector) {
	return function() {
		if ($emailSelector.val() == '' || $passwordSelector.val() == '') {
			$("." + modalSelector).removeClass(modalSelector + "-hidden");
			return false;
		}
		else {
			return true;
		}
	};
};

$(document).ready(function() {
	$(".btn-login").on('click', function() {
		var isGood = checkInput("modal-incomplete-input", $("#email-input"), $("#password-input"))();

		if (isGood == true) {
			$.post("/login", {
				'username': $("#email-input").val(),
				'password': $("#password-input").val(),
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
						window.location.pathname = '/metrics';

				}
			});
		}
	});

	$("input").keydown(function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
		}
	});
});
