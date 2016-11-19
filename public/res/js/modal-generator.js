/*globals $*/
var FingModal = function(headerTxt, messageTxt, danger) {
    var textClass = danger ? 'danger-text' : 'success-text';
    var buttonClass = danger ? 'btn-reject' : 'btn-success';
    
    this.header = $('<h2>').addClass('m-b-1 ' +textClass).text(headerTxt);
    this.message = $('<p>').text(messageTxt);
    this.button = $('<a>').addClass('btn '+buttonClass).text('Close');
    
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
        $(document.body).append(this.el);
        this.el.removeClass('hidden');
    };

    this.hide = function() {
        this.el.addClass('hidden');
        $(this.el).remove();
    };

    var self = this;
    this.button.click(function() {
        self.hide();
    });
};



$(document).ready(function() {
    var ModalView = Backbone.View.extend({
	el: $('body'),
	header: undefined,
	message: undefined,
	isDangerous: undefined,

	initialize: function(attrs) {
	    // Pull parameters of object passed to ModalView
	    this.options = attrs;

	    // Set all possibilities equal to internal objects:
	    // note that the user of this view may not pass certain
	    // objects: This is okay, because at the end of the day,
	    // they are undefined anyways.
	    this.header = this.options.header;
	    this.message = this.options.message;
	    this.isDangerous = this.options.isDangerous;

	    // Simple Backbone binding schema.
	    _.bindAll(this, 'render');
	    this.render();
	},

	render: function() {
	    $(this.el).append("<a>A Modal.</a>");
	}
    });

    var modalView = new ModalView({
	header: "Nice",
	message: "You made an account!",
    });
});
