window.onhashchange = function(){
    if (window.location.hash === '#logout'){
	$.get('/logout',function(){

	    var notFoundModal = produceModal("Bye!", "You are logged out. Redirecting you to the login page.", true);
	    notFoundModal.click = function() {
		window.location = '/login';
	    }

	    displayWindow(notFoundModal);
	});
    }
};
