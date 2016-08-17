/*
 * Constructor for a Modal, which via the display
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
var Modal = function( modalClassName, btnClassName ) {
    return (function() {
	var _localModalClassName = modalClassName;
	var _localBtnClassName = btnClassName;
	var _checkToggled = false;

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
	* Internal function for our ModalGenerator, sets checkToggled
	* as false again to allow multiple refirings: this is to avoid
	* the use of the display method multiple times which results in
        * bugs.
	* @method
	* @param {string} primaryClassName - the name of the modal
	* window which we will be hiding. 
	*/
	var _rearm = function( ) {
	    _checkToggled = false;
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
	    //See: rearm to understand why I use this checkToggled parameter.
	    if (_checkToggled == false) {
	      $("." + _localModalClassName).removeClass( _generateHiddenClass(_localModalClassName));
	      _buildToggleableUnit( _localModalClassName, _localBtnClassName);
	      _checkToggled = true;
	    } else {
		throw "A modal window was already created: please call the rearm method to allow another toggle.";
	    }
	};

	return {
	    display: displayModalOnView,
	    rearm: _rearm
	};
    })();
};

