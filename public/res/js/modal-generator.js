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
