$(document).ready(function() {
    $(".page-nav").each(function( index, element ){
	if ($(this)[0].text  === "Log-Off") {
	    $(this).click(function(){
		//Send logout stuff here.
	    });
	};
    });
});
