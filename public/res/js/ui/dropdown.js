// TODO: WRITE UP DOCS.
// RELIES QUITE A BIT ON GLOBAL STATE :-/
var DropdownReplacer = (function () {
    function _generateAnchor($el) {
	var newAnchor = $('<a>')
	    .addClass($el.attr('subclasses'))
	    .attr({
		'id': $el.attr('id'),
		'set':false
	    }).text($el.attr('name'));

	return newAnchor;
    }

    function _replaceDropdowns() {
	// Iterate through each selection document
	// node: these selection objects are usually
	// fairly ugly, we make our own version here.
	$('select').each(function(i, element) {
	    var $el = $(element);
	    var anchor = _generateAnchor($el);
	    var optionContainer = $('<div class="dropdown-menu-custom hidden">')

	    // On the click of the dropdown element, we
	    // remove the hidden class, showing everything
	    // contianed.
	    anchor.click(function(event){
		optionContainer.toggleClass('hidden');

		// Stop the event from bubbling up the call
		// chain.
		event.stopPropagation();
	    });

	    // Our drop-downs render weird in the case that we do
	    // not add a btn-margin fix. This is a hack, but I am
	    // refactoring the server logic code, not the markup
	    // (for now.)
	    var extraAppendage = "";

	    $el.children().each(function(item, element) {
		if (item === 0) {
		    extraAppendage += "btn-margin-fix";
		} 

		optionContainer.append(
		    $('<a class="dropdown-item btn btn-setup-dropdown ' + extraAppendage + '">')
			.click(function(){
			    anchor.text($(this).text())
			    .attr('set', true);
			}).text(element.innerText);
		)
	    });

	    $el.parent().append(
		$('<div class="row">').append(anchor)
	    ).append(
		$('<div class="row">').append(
		    $('<div class="btn-group">').append(optionContainer)
		)
	    );

	    $el.remove();

	    // If any portion of the page is clicked while our dropdown
	    // is expanded, we will want to collapse our dropdown.
	    $(document).click(function(){
		$('.dropdown-menu-custom').addClass('hidden');
	    });
	});

	return {
	    replaceDropdowns: _replaceDropdowns
	}
    };
})();
