/*
 * Constructor for a ModalGenerator, which via the display
 * method allows a modal to be displayed on document startup.
 * @constructor
 * @param {string} primaryClassName - the name of the modal
 * window. 
 * @param {string} btnClassName - the class name of the actual
 * button contained within our modal window.
 * @example
 * var displayModal = modalGenerator( "modal-internal-error", "btn-internal-error-close" );
 * displayModal.display();
 *
*/
var modalGenerator = function( modalClassName, btnClassName ) {
    return (function() {
	var _localModalClassName = modalClassName;
	var _localBtnClassName = btnClassName;

	/*
	* Internal function for our ModalGenerator, generates the 
	* hidden class which is simpily the primary class name with
	* hidden appended to it. 
	* @method
	* @param {string} primaryClassName - the name of the modal
	* window which we will be hiding. 
	*/
	var _generateHiddenClass = function( primaryClassName ) {
	    return (primaryClassName + "-hidden");
	};

	/*
	* Internal function for our ModalGenerator, generates the 
	* toggleable button on a modal that allows it to be turned off.
	* @method
	* @param {string} primaryClassName - the name of the modal
	* window. 
	* @param {string} btnClassName - the class name of the actual
	* button contained within our modal window.
	*/
	var _buildToggleableUnit = function( primaryClassName, btnClassName ) {
	    $( "." + btnClassName ).on('click', function(){
		$( "." + primaryClassName ).addClass( _generateHiddenClass(primaryClassName) );
	    });
	};

	/*
	* Internal function for our ModalGenerator, automatically the 
	* shows a modal which is by default hidden.
	* @method
	* @param {string} primaryClassName - the name of the modal
	* window. 
	* @param {string} btnClassName - the class name of the actual
	* button contained within our modal window.
	*/
	var displayModalOnView = function ( ) {
	      $("." + _localModalClassName).removeClass( _generateHiddenClass(_localModalClassName));
	      _buildToggleableUnit( _localModalClassName, _localBtnClassName);
	};

	return {
	    display: displayModalOnView
	};
    })();
};


$(document).ready(function(){
    var displayModal = modalGenerator( "modal-internal-error", "btn-internal-error-close" );
    displayModal.display();
});

