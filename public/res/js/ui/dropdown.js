/*
  Notes:
  This replacer takes all selection nodes
  and replaces them with styled anchor tags.
  It is required that each of these selection
  tags has an id.
*/
var DropdownReplacer = (function () {
    var dropdownButtonClasses = ["btn", "btn-setup-dropdown"];
    var dropdownMenuClasses = ["dropdown-menu-custom"];
    var dropdownItemClasses = ["dropdown-item", "btn", "btn-setup-dropdown"];

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

    function _dropDown($dropdownMenu) {
	var hadClass = $dropdownMenu.hasClass('hidden');
	
	$(dropdownItemClasses.join(" ")).removeAttr('href');
	$(dropdownMenuClasses.join(" ")).addClass('hidden');

	if (hadClass) {
	    $dropdownMenu.removeClass('hidden');
	    $dropdownMenu.children().attr('href', '#');
	}
    }

    function _replaceDropdowns($parent) {
	// Iterate through each selection document
	// node: these selection objects are usually
	// fairly ugly, we make our own version here.
	$parent.find('select').each(function(i, element) {
	    var $el = $(element);
	    var $dropdownItems = $('<div>')
		.addClass('dropdown-menu-custom')
		.addClass('hidden');

	    var $anchor = _generateDropdownButton($el);

	    // On the click of the dropdown element, we
	    // remove the hidden class, showing everything
	    // contianed.
	    $anchor.click(function(event){
		// Stop the event from bubbling up the call
		// chain.
		_dropDown($dropdownItems);
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
		$('<div class="row">').append(
		    $('<div class="btn-group">').append($dropdownItems)
		)
	    );

	    // Remove the old dropdown.
	    $el.remove();

	    // If any portion of the page is clicked while our dropdown
	    // is expanded, we will want to collapse our dropdown.
	    $(document).click(function(){
		$(dropdownItemClasses.map(function(item){
		    return "." + item;
		})[0]).removeAttr('href');

		$(dropdownMenuClasses.map(function(item){
		    return "." + item;
		})[0]).addClass('hidden');
	    });
	});
    };

    return {
	replaceDropdowns: _replaceDropdowns
    }
})();
