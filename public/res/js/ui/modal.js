var ModalView = Backbone.View.extend({
    header: undefined,
    message: undefined,
    isDangerous: undefined,

    textClass: this.isDangerous  ? 'danger-text' : 'success-text',
    buttonClass: this.isDangerous ? 'btn-reject' : 'btn-success',


    btnText: 'Close',
    closeFn: function(){},

    template: _.template(function() {
	tag = "";
	tag += '<div class="modal">';
	tag +=   '<div class="overlay fadein begin-transparent">';
	tag +=     '<div class="window">';
	tag +=       '<div class="top-text">';
	tag +=         '<h2 class="m-b-1 <%= this.textClass %>"><%= this.header %></h2>';
	tag +=         '<p><%= this.message %></p>';
	tag +=       '</div>';
	tag +=       '<div class="bottom-text text-xs-right">';
	tag +=         '<a class="btn btn-exit <%= this.buttonClass %>">'
	if (this.btnText) {
	    tag +=           this.btnText;
	} else {
	    tag +=           "Close";
	}
        tag +=         '</a>';
	tag +=       '</div>';
	tag +=     '</div>';
	tag +=   '</div>';
	tag += '</div>';
	return tag;
    }()),

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
	this.textClass = this.isDangerous  ? 'danger-text' : 'success-text';
	this.buttonClass = this.isDangerous ? 'btn-reject' : 'btn-success';

	if (this.options.closeFn) {
	    this.closeFn = this.options.closeFn;
	}


	// Simple Backbone binding schema.
	_.bindAll(this, 'render');
	this.render();

	$(document).keypress(function(event) {
	    if (event.which === 13 ) {
		$(".modal").parent().remove();
	    }
	});
    },

    render: function() {
	this.el.innerHTML = this.template();
	return this;
    },

    events: {
	"click .btn": "removeModal",
	"click .overlay": "removeModal",
	"keyup .btn-exit": "removeModal",
    },

    removeModal: function(event) {
	// Quite coupled: Watch out here.
	this.closeFn();
	if ($(event.target).hasClass("btn-exit") || $(event.target).hasClass("overlay")) {
	    this.undelegateEvents();
	    this.$el.removeData().unbind(); 
	    this.remove();  
	    Backbone.View.prototype.remove.call(this);
	}
    },

    display: function($el) {
	$.when($el.append(this.render().el)).then(function() {
	    setTimeout(function(){
		$el.find(".begin-transparent").removeClass('begin-transparent');
	    }, 50);
	});
    }
});


function produceModal(header, message, isDangerous) {
    if (($('body').has('.window').length !== 0)) {
	$(".modal").parent().remove();
    } 

    var modalItem = new ModalView({
	header: header,
	message: message,
	isDangerous: isDangerous
    });

    return modalItem;
}
