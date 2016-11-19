// returns whether all inputs have values set
function validateRequired(){
    var inputsSatisfied = $('input.required').filter(function(i,element) {
		return !element.value;
	}).length === 0;
	var selectionsSatisfied = $('.btn.required[set=false]').length === 0;
	return inputsSatisfied && selectionsSatisfied;
}

// Replace selects with dropdowns
$(document).ready(function() {
    var currentZIndex = 9999;
    
    $('select').each(function(i, element) {
        
        var $el = $(element);

        var anchor = $('<a>')
            .addClass($el.attr('subclasses'))
            .attr({
                'id':$el.attr('id'),
                'set':false
            }).text($el.attr('name'));
            
        var optionContainer = $('<div class="dropdown-menu-custom hidden">');

        anchor.click(function(e){
            optionContainer.toggleClass('hidden');
            e.stopPropagation();
        });

	var incrementer = 0;

        $el.children().each(function(i, optionElement) {
	    if (incrementer === 0){
		var extraAppendage = "btn-margin-fix";
	    } else {
		var extraAppendage = "";
	    }

            optionContainer.append(
                $('<a class="dropdown-item btn btn-setup-dropdown ' + extraAppendage + '">').click(function(){
                    anchor.text($(this).text())
                        .attr('set',true);
                }).text(
                    optionElement.innerText    
                )
            );

	    incrementer++;
        });

        $el.parent().append(
            $('<div class="row">').append(anchor)
        ).append(
            $('<div class="row">').append(
                $('<div class="btn-group">').append(optionContainer)
            )
        );

        $el.remove();
    });
})
$(document).click(function(){
    $('.dropdown-menu-custom').addClass('hidden');
});
