/*
 * Constructor for a DropdownGenerator, which via the display
 * method allows a dropdown to be displayed on document startup.
 * @constructor
 * @param {string} btnClassName - the name of the button being
 * pressed. 
 * @param {string} dropdownClassName - the class name of the dropdown
 * menu.
 * @example
 *
*/

var DropdownGenerator = function( btnClassName, dropdownClassName ) {
    return (function() {
	var _localBtnClassName = btnClassName;
	var _localDropdownClassName = dropdownClassName;
	var _isActive = false;
	var _mode = "default";

	/*
	* Internal function that handles when anything besides our 
        * dropdown button has been selected.
	* @method
	*/
	var _blur = function ( ) {
	    $("." + _localDropdownClassName).addClass(_localDropdownClassName+"-hidden");
	};

	/*
	* Internal function that handles the construction of our 
        * button and its underlying logic. Think of this as the
        * build method (which I name its public interface) in
        * a build pattern.
	* @method
	*/
	var _generateBinding = function ( ) {

	    $("body").on("click", function() {
		if (_isActive){
		  window.setTimeout(function(){
		  _blur();
		  _isActive = false;
		  }, 15);};
	    });

	    $("." + _localBtnClassName).on("click", function() {
		window.setTimeout(function(){
		_isActive = !_isActive;
		}, 10);
		$("." + _localDropdownClassName).toggleClass(_localDropdownClassName+"-hidden");
	    });
	};
	
	/*
	* Internal function that takes a string and assigns
        * a mode state to our button: right now it has default,
        * which does literally nothing and replace, which makes
        * any clicked item (Added by push item) replace the text
        * inside of the primary button.
	* @method
	* @param {string} mode - The mode (which can be "default" and
        * "replace" that we will assign our internal mode state to be.
	*/
	var _setMode = function ( mode ) {
	    if (mode == "default") {
		_mode = "default";
	    } else if (mode == "replace") {
		_mode = "replace";
	    } else {
		throw "Invalid mode in _setMode";
	    }

	};

	/*
	* Internal function that takes a selector of a dropdown
        * item and creates a JQuery mode to the item being clicked
        * that basically replaces the buttons text. Mentioned in _setMode.
	* @method
	* @param {string} selector - the item class name that is to be
        * placed into JQuery. Do not add a ., this will be done in the 
        * method.
	*/
	var _pushItemSelector = function ( selector ) {
	    $("." + selector).on("click", function(){
		if (_mode == "replace"){
		    $("."+_localBtnClassName).html($("." + selector).text());
		    $("." + _localDropdownClassName).addClass(_localDropdownClassName+"-hidden");
		} 
	    });
	};

	return {
	    buildButton: _generateBinding,
	    pushItem: _pushItemSelector,
	    setMode: _setMode
	};
    })();
};
