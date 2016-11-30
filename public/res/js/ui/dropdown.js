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

		if (event.screenX === 0 && event.screenY === 0) {
		    $anchor.focus();
		}

		_dropDown($dropdownItems);
	    })
	    .text($element.text());

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

    // Performs replacement of selection nodes with our new,
    // nice dropdowns.
    function _replaceDropdowns($parent) {
	// Iterate through each selection document
	// node: these selection objects are usually
	// fairly ugly, we make our own version here.
	$parent.find('select').each(function(i, element) {
	    var $el = $(element);
	    var $anchor = _generateDropdownButton($el);
	    var $dropdownItems = $('<div>')
		.addClass(dropdownMenuClasses.join(" "))
		.addClass(disabledClass);

	    // On the click of the dropdown element, we
	    // remove the hidden class, showing everything
	    // contianed.
	    $anchor.click(function(event){
		// Stop the event from bubbling up the call
		// chain.
		_dropDown($dropdownItems);
		if (event.screenX !== 0 && event.screenY !== 0) {
		    $anchor.blur();
		}
		event.stopPropagation();
	    });

	    // Our drop-downs render weird in the case that we do
	    // not add a btn-margin fix. This is a hack, but I am
	    // refactoring the server logic code, not the markup
	    // (for now.)
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
		$().removeAttr('href');

		$(dropdownMenuClasses.map(function(item){
		    return "." + item;
		})[0]).addClass(disabledClass);
	    });
	});
    };

    return {
	replaceDropdowns: _replaceDropdowns
    };
})();
