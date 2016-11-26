// Set a function on the event that a
// windows hash is changed. This basically
// guarantees a user is forcefully logged
// out after pressing logout.
window.onhashchange = function(){
    if (window.location.hash === '#logout') {
	$.get('/logout', function(){

	    var logoutModal = new ModalView({
		header: "Good Bye!",
		message: "We are logging you our right now!",
		isDangerous: false,
		closeFn: function() {
		    window.location = '/login';
		}
	    });

	    logoutModal.display($("body"));
	});
    }
};
