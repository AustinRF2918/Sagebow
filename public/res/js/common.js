// returns whether all inputs have values set
function validateRequired(){
    var inputsSatisfied = $('input.required').filter(function(element) {
		return !!element.value;
	}).length === 0;
	var selectionsSatisfied = $('.btn.required[set=false]').length === 0;
	return inputsSatisfied && selectionsSatisfied;
}

/*globals $*/
var FingModal = function(headerTxt, messageTxt, danger) {
    var textClass = danger ? 'danger-text' : 'happy-text';
    this.header = $('<h2>').addClass('m-b-1', 'danger-text').text(textClass);
    this.message = $('<p>').text(messageTxt);
    this.button = $('<a>').addClass('btn').text('Close');
    this.el = $('<div>').addClass('modal hidden').append(
        $('<div>').addClass('overlay').append(
            $('<div>').addClass('window').append(
                $('<div>').addClass('top-text')
                .append(this.header)
                .append(this.message)
            ).append(
                $('<div>').addClass('bottom-text text-xs-right').append(this.button)
            )
        )
    );

    this.show = function() {
        $(document).append(this.el);
        this.el.removeClass('hidden');
    };

    this.hide = function() {
        this.el.addClass('hidden');
    };

    var self = this;
    this.button.click(function() {
        self.hide();
    });
};

//Emulates static object.
var FingUtilities = function() {};

/*
FingUtilities.inputToAnchor = function($el) {
    return $('<a>')
        .addClass($(el).attr(subclasses))
        .attr('id', $el.attr('id'))
        .text($el.attr('name'));
}
*/

/*
FingUtilities.initializeDropdowns = function() {
    $('select').each(function(element){
        var anchor = $('<a>').addClass 
    })
}
*/


// Replace selects with dropdowns
$(document).ready(function() {
    var currentZIndex = 9999;
    
    $('select').each(function(i, element) {
        currentZIndex++;
        
        var $el = $(element);

        var anchor = $('<a>')
            .addClass($el.attr('subclasses'))
            .attr({
                'id':$el.attr('id'),
                'set':false
            }).text($el.attr('name'));
            
        var optionContainer = $('<div class="dropdown-menu hidden">');

        anchor.click(function(e){
            optionContainer.toggleClass('hidden');
            e.stopPropagation();
        });

        // generate options
        $el.children().each(function(i, optionElement) {
            optionContainer.append(
                $('<a class="dropdown-item btn btn-setup-dropdown">').click(function(){
                    anchor.text($(this).text())
                        .attr('set',true);
                }).text(
                    optionElement.innerText    
                )
            );
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
    $('.dropdown-menu').addClass('hidden');
});