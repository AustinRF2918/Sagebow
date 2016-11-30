/*
  Notes:
  This replacer takes all selection nodes
  and replaces them with styled anchor tags.
  It is required that each of these selection
  tags has an id.
*/
var DropdownReplacer = (function (optionals) {
    var dropdownButtonClasses = (optionals && optionals.buttonClasses) || ["btn", "btn-setup-dropdown"];
    var dropdownMenuClasses = (optionals && optionals.menuClasses) || ["dropdown-menu-custom"];
    var dropdownItemClasses = (optionals && optionals.itemClasses) || ["dropdown-item", "btn", "btn-setup-dropdown"];

    var rowSeperatorClass = (optionals && optionals.seperatorClass) || "row";
    var buttonGroupClass = (optionals && optionals.groupClass) || "btnGroup";
    var disabledClass = (optionals && optionals.disabledClass) || "hidden";

    function _getFirstElement(list) {
	return list.map(function(item){
	    return "." + item;
	})[0];
    }

    function _eventFromKeyboard(event) {
	return event.screenX === 0 && event.screenY === 0;
    }
    // Generates an anchor that represents a button
    // that toggles the state of a dropdown. This will
    // replace the "select" nodes on a subsection of the DOM. 
    function _generateDropdownButton($el) {
	return $('<a>')
	    .addClass($el.attr('subclasses'))
	    .attr({
		'href': '#',
		'id': $el.attr('id'),
		'set': false
	    }).text($el.attr('name'));
    }

    // Generates an anchor that represents a button
    // that allows the value of a dropdown to be changed.
    function _generateDropdownItem($element, $anchor, $dropdownItems) {
	return $('<a>')
	    .addClass(dropdownItemClasses.join(" "))
	    .click(function(event){
		$anchor.text($(this).text()).attr('set', true);

		if (_eventFromKeyboard(event)) {
		    $anchor.focus();
		}

		_dropDown($dropdownItems);
	    })
	    .text($element.text());

    }

    // Generates the container for the dropdown items.
    function _generateDropdownContainer() {
	return $('<div>')
	    .addClass(dropdownMenuClasses.join(" "))
	    .addClass(disabledClass);
    }

    // Performs dropdown action based on certain state
    // variables.
    function _dropDown($dropdownMenu) {
	var hadClass = $dropdownMenu.hasClass(disabledClass);
	
	$(_getFirstElement(dropdownItemClasses)).removeAttr('href');
	$(_getFirstElement(dropdownMenuClasses)).addClass(disabledClass);

	if (hadClass) {
	    $dropdownMenu.removeClass(disabledClass);
	    $dropdownMenu.children().attr('href', '#');
	}
    }

    // Performs the actual replacement.
    function _replaceDropdowns($parent) {
	// Iterate through each selection item.
	$parent.find('select').each(function(i, element) {
	    var $el = $(element);
	    var $anchor = _generateDropdownButton($el);
	    var $dropdownItems = _generateDropdownContainer();

	    // On the click of the dropdown element, we
	    // remove the hidden class, showing everything
	    // contianed.
	    $anchor.click(function(event){
		// Stop the event from bubbling up the call
		// chain.
		_dropDown($dropdownItems);
		if (_eventFromKeyboard(event)) {
		    $anchor.blur();
		}
		event.stopPropagation();
	    });

	    $el.children().each(function(item, element) {
		// Append each of the dropdown items as a
		// new anchor tag which is a child to the original
		// select (now anchor) element.
		$dropdownItems.append(
		    _generateDropdownItem($(element), $anchor, $dropdownItems)
		);
	    });

	    // Make rows and sub-rows and append the generated
	    // anchor element and optionContainer element.
	    $el.parent().append($anchor)
		.append(
		$('<div class="' + rowSeperatorClass +'">').append(
		    $('<div class="' + buttonGroupClass +'">').append($dropdownItems)
		)
	    );

	    // Remove the old dropdown.
	    $el.remove();

	    // If any portion of the page is clicked while our dropdown
	    // is expanded, we will want to collapse our dropdown.
	    $(document).click(function(){
		$(_getFirstElement(dropdownItemClasses)).removeAttr('href');
		$(_getFirstElement(dropdownMenuClasses)).addClass(disabledClass);
	    });
	});
    };

    return {
	replaceDropdowns: _replaceDropdowns
    };
})();
