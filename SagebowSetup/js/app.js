var _generateHiddenClass = function( primaryClassName ) {
    return (primaryClassName + "-hidden");
};

var _buildToggleableUnit = function( primaryClassName, btnClassName ) {
    $( "." + btnClassName ).on('click', function(){
	$( "." + primaryClassName ).addClass( _generateHiddenClass(primaryClassName) );
    });
};

var displayModalOnView = function ( primaryClassName ,btnClassName ) {
    $("." + primaryClassName).removeClass( _generateHiddenClass(primaryClassName));
    _buildToggleableUnit( primaryClassName, btnClassName);
};

$(document).ready(function(){
    displayModalOnView("modal-internal-error", "btn-internal-error-close");
});

