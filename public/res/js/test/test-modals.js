if (!(typeof window != 'undefined' && window.document)) {
    var vm = require('vm');
    var fs = require('fs');
    vm.runInThisContext(fs.readFileSync('./ui/modal.js'));
    var chai = require('chai');
}
var expect = chai.expect;

describe("Modal Functionality (Unit Tests)", function() {
    describe("Modal windows are generatable", function() {
	it ('Creates a legitimate modal with Backbone options.', function() {
	    var modal = new ModalView({
		header: "Hello",
		message: "World",
		isDangerous: true
	    });

	    expect( modal.header ).to.equal( "Hello" );
	    expect( modal.message ).to.equal( "World" );
	    expect( modal.isDangerous ).to.equal( true );
	});

	it ('Custom construction function.', function() {
	    var modal = produceModal("Hello", "World", true);

	    expect( modal.header ).to.equal( "Hello" );
	    expect( modal.message ).to.equal( "World" );
	    expect( modal.isDangerous ).to.equal( true );
	});
    });

    describe("The template renders properly (heuristic.)", function() {
	it ('Properly renders a generic modal.', function() {
	    var modal = new ModalView({
		header: "Hello",
		message: "World",
		isDangerous: true
	    });

	    expect( modal.template() ).to.include( '<div class="modal' );
	    expect( modal.template() ).to.include( '<div class="overlay ' );
	    expect( modal.template() ).to.include( '<p>World</p>' );
	    expect( modal.template() ).to.include( 'bottom-text' );
	    expect( modal.template() ).to.include( 'btn btn-exit' );
	    expect( modal.template() ).to.include( 'Close' );
	});

	it ('Properly renders a dangerous modal.', function() {
	    var modal = new ModalView({
		header: "Hello",
		message: "World",
		isDangerous: true
	    });

	    expect( modal.template() ).to.include( 'danger-text' );
	    expect( modal.template() ).to.include( 'btn btn-exit btn-reject' );
	});

	it ('Properly renders a non-dangerous modal.', function() {
	    var modal = new ModalView({
		header: "Hello",
		message: "World",
		isDangerous: false
	    });

	    expect( modal.template() ).to.include( 'success-text' );
	    expect( modal.template() ).to.include( 'btn btn-exit btn-success' );
	});
    });

    describe("Properly destroys itself", function() {
	it ('Properly calls remove modal on itself.', function() {
	    var modal = new ModalView({
		header: "Hello",
		message: "World",
		isDangerous: true
	    });

	    var node = $("<div>");
	    node.append($(modal.render().el.innerHTML));

	    expect( node.html() ).to.not.equal("");

	    modal.removeModal({target: $("<a class='btn-exit'>")});

	    // Represents a re-render

	    node = $("<div>");

	    expect( modal.el ).to.not.equal("");
	    expect( node.html() ).to.equal("");
	});
    });
});
