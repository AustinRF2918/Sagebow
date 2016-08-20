/*globals $*/
var FingModal = function(headerTxt, messageTxt, danger){
    var textClass = danger ? 'danger-text' : 'happy-text';
    this.header = $('<h2>').addClass('m-b-1','danger-text').text(textClass);
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
    
    this.show = function(){
        $(document).append(this.el);
        this.el.removeClass('hidden');
    };
    this.hide = function(){
        
    };
    
    var self = this;
    this.button.click(function(){
        self.hide();
    });
};