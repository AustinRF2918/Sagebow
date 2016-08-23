window.onhashchange = function(){
	if(window.location.hash === '#logout'){
		$.get('/logout',function(){
			var bye = new FingModal('Bye!', 'You are Logged Out. Redirecting you to the login page.',false);
			bye.button.click(function(){
				window.location = '/login';
			});
			bye.show();
		});
	}
};