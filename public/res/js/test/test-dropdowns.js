var expect = chai.expect;

describe("Dropdown Functionality", function() {
    describe("Utilities functions should work.", function() {
	it ('throws when we pass nothing.', function() {
	    var jqueryHello = DropdownReplacer._internal.getFirstElement(["Hello"]);
	    expect( jqueryHello ).to.equal(".Hello");
	});

	it ('gets the first element.', function() {
	    var jqueryHello = DropdownReplacer._internal.getFirstElement(["Hello", "World"]);
	    expect( jqueryHello ).to.equal(".Hello");
	});

	it ('throws when we pass nothing.', function() {
	    expect(function() {
		var bad = DropdownReplacer._internal.getFirstElement();
	    }).to.throw(TypeError)
	});

	it ('throws when we pass absolutely nothing.', function() {
	    expect(function() {
		var bad = DropdownReplacer._internal.getFirstElement([]);
	    }).to.throw(TypeError)
	});

	it ('throws when we pass string.', function() {
	    expect(function() {
		var bad = DropdownReplacer._internal.getFirstElement("");
	    }).to.throw(TypeError)
	});
    });

    describe("Properly recognizes event from keyboard.", function() {
	it ('Shows all permutations being correct.', function() {
	    var mockEvent = {
		screenX: 1,
		screenY: 0
	    }
	    expect( DropdownReplacer._internal.eventFromKeyboard(mockEvent) ).to.equal( false );

	    mockEvent.screenX = 0;
	    expect( DropdownReplacer._internal.eventFromKeyboard(mockEvent) ).to.equal( true );

	    mockEvent.screenY = 1;
	    expect( DropdownReplacer._internal.eventFromKeyboard(mockEvent) ).to.equal( false );

	    mockEvent.screenX = 1;
	    expect( DropdownReplacer._internal.eventFromKeyboard(mockEvent) ).to.equal( false );

	    mockEvent.screenX = 22;
	    mockEvent.screenY = -2;
	    expect( DropdownReplacer._internal.eventFromKeyboard(mockEvent) ).to.equal( false );

	    mockEvent.screenX = undefined;
	    mockEvent.screenY = -2;
	    expect( DropdownReplacer._internal.eventFromKeyboard(mockEvent) ).to.equal( false );
	});
    });
});
