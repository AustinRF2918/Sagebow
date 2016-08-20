var checkInput = function( modalSelector, $emailSelector, $passwordSelector ) {
    return function(){
	if ($emailSelector.val() == '' || $passwordSelector.val() == '') {
	    $( "." + modalSelector ).removeClass( modalSelector + "-hidden" );
	    return false;
	} else {
	    return true;
	}
    };
};

$(document).ready(function(){
    
    $(".btn-modal-incomplete-input-reject").on('click', function(){
	$(".modal-incomplete-input").toggleClass("modal-incomplete-input-hidden");
    });

    $(".btn-modal-dne-input-reject").on('click', function(){
	$(".modal-dne-input").toggleClass("modal-dne-input-hidden");
    });

    $(".btn-modal-ip-input-reject").on('click', function(){
	$(".modal-ip-input").toggleClass("modal-ip-input-hidden");
    });
    $(".btn-login").on('click', function(){
	var isGood = checkInput( "modal-incomplete-input", $("#email-input"), $("#password-input"))();

	if ( isGood == true ) {
	    $.post("/login", {
		'username': $("#email-input").val(),
		'password': $("#password-input").val(),
		'dataType': "json"
	    }).done(function( msg, status, jqXHR ) {
		var response = $.parseJSON( msg );
		if ( response.code == 404 ) {
		    $(".modal-dne-input").toggleClass("modal-dne-input-hidden");
		} else if ( response.code == 401 ) {
		    $(".modal-ip-input").toggleClass("modal-ip-input-hidden");
		}
	    });
	}
    });

    $("input").keydown(function (event) {
	if (event.keyCode === 13){
	    event.preventDefault();
	}
    });
});

