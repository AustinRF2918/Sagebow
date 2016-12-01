if (!(typeof window != 'undefined' && window.document)) {
    var vm = require('vm');
    var fs = require('fs');
    vm.runInThisContext(fs.readFileSync('./ui/dropdown.js'));
    var chai = require('chai');
}
var expect = chai.expect;

describe("Dropdown Functionality (Unit Tests)", function() {
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
	    }).to.throw(TypeError);
	});

	it ('throws when we pass absolutely nothing.', function() {
	    expect(function() {
		var bad = DropdownReplacer._internal.getFirstElement([]);
	    }).to.throw(TypeError);
	});

	it ('throws when we pass string.', function() {
	    expect(function() {
		var bad = DropdownReplacer._internal.getFirstElement("");
	    }).to.throw(TypeError);
	});
    });

    describe("Properly recognizes event from keyboard.", function() {
	it ('Shows all permutations being correct.', function() {
	    var mockEvent = {
		screenX: 1,
		screenY: 0
	    };

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

    describe("Dropdown buttons are generatable", function() {
	it ('Creates a legitimate button.', function() {
	    var $mockEl = $('<a>')
		.attr('name', 'testName')
		.attr('subclasses', 'testClass')
		.attr('id', 'testIdentifier');

	    var $testButton = DropdownReplacer._internal.generateDropdownButton($mockEl);

	    expect( $testButton.text() ).to.equal( "testName" );
	    expect( $testButton.attr('id') ).to.equal( "testIdentifier" );
	    expect( $testButton.hasClass('testClass') ).to.equal(true);
	    expect( $testButton.attr('href') ).to.equal( "#" );
	    expect( $testButton.attr('set') ).to.equal( 'false' );
	});

	it ('Creates a more complex button.', function() {
	    var $mockEl = $('<a>')
		.attr('name', 'testName')
		.attr('subclasses', 'testClassA testClassB')
		.attr('id', 'testIdentifier');

	    var $testButton = DropdownReplacer._internal.generateDropdownButton($mockEl);

	    expect( $testButton.text() ).to.equal( "testName" );
	    expect( $testButton.attr('id') ).to.equal( "testIdentifier" );
	    expect( $testButton.hasClass('testClassA') ).to.equal(true);
	    expect( $testButton.hasClass('testClassB') ).to.equal(true);
	    expect( $testButton.hasClass('testClassC') ).to.equal(false);
	    expect( $testButton.attr('href') ).to.equal( "#" );
	    expect( $testButton.attr('set') ).to.equal( 'false' );
	});
    });

    describe("Dropdown items  are generatable", function() {
	var $element;
	var $anchor;
	var $mockEl;
	var $dropdownItems;

	beforeEach(function() {
	    $element = $("<a>").text("testText");
	    $anchor = $("<a>");
	    $dropdownItems = $("<a>")
		.addClass("disabled");
	    $mockEl = DropdownReplacer._internal.generateDropdownItem($element, $anchor, $dropdownItems);
	});

	it ('Has the neccessary classes.', function(){
	    expect( $mockEl.text() ).to.equal("testText");
	    expect( $mockEl.text() ).to.not.equal("testTextBad");
	    expect( $mockEl.hasClass("dropdown-item") ).to.equal(true);
	    expect( $mockEl.hasClass("btn") ).to.equal(true);
	    expect( $mockEl.hasClass("btn-setup-dropdown") ).to.equal(true);
	    expect( $mockEl.hasClass("btn-setup-dropdown-bad") ).to.not.equal(true);
	});

	it ('Has the neccessary text.', function() {
	    expect( $mockEl.text() ).to.equal("testText");
	    expect( $mockEl.text() ).to.not.equal("testTextBad");
	});
    });

    describe("Dropdown containers are generatable.", function() {
	it ('Has the neccessary classes.', function(){
	    var $mockEl = DropdownReplacer._internal.generateDropdownContainer();
	    expect( $mockEl.hasClass("dropdown-menu-custom") ).to.equal(true);
	});

	it ('Begins disabled.', function() {
	    var $mockEl = DropdownReplacer._internal.generateDropdownContainer();
	    expect( $mockEl.hasClass("hidden") ).to.equal(true);
	});
    });

    describe("Dropdown functionality affects all nodes on DOM.", function() {
	var $element;
	var $anchor;
	var $mockEl;
	var $dropdownContainer;
	var $newItem;

	beforeEach(function() {
	    $element = $("<a>").text("testTextA");
	    $anchor = $("<a>").attr('set', false);
	    $dropdownContainer = $("<a>")
		.addClass("disabled")
		.text("testTextB");
	    $newItem = $("<a>");
	    $dropdownContainer.append($newItem);

	    $mockEl = DropdownReplacer._internal.generateDropdownItem($element, $anchor, $dropdownContainer);
	});

	it ('Constructs properly.', function(){
	    expect( $anchor.attr("set") ).to.equal('false');
	    expect( $anchor.text() ).to.equal("");
	});

	it ('Affects the button of the container when clicked.', function(){
	    $mockEl.click();
	    expect( $anchor.text() ).to.equal("testTextA");
	    expect( $anchor.attr("set") ).to.equal('true');
	});
    });
});

describe("Dropdown Integration (Component Integration)", function() {
    var $anchor;
    var $dropdownContainer;
    var $selector = $('<select class="btn-cluster" name="Gender" id="gender" subclasses="btn required btn-setup-dropdown"><option>Male</option><option>Female</option></select>');

    beforeEach(function() {
	$anchor = DropdownReplacer._internal.generateDropdownButton($selector);
	$dropdownContainer = DropdownReplacer._internal.generateDropdownContainer();
	$selector.children().each(function(item, element) {
	    $dropdownContainer.append(
		DropdownReplacer._internal.generateDropdownItem($(element), $anchor, $dropdownContainer)
	    );
	});
    });


    it ('Makes button go active on sub-item click.', function() {
	$dropdownContainer.children().click();
	expect( $anchor.hasClass('hidden') ).to.equal(false);
    });

    it ('Makes button replace text on sub-item click.', function() {
	$dropdownContainer.children().click();
	expect( $anchor.text() ).to.equal("Female");
    });

    it ('Allows switching of choices.', function() {
	$dropdownContainer.children()[0].click();
	expect( $anchor.text() ).to.equal("Male");
	$dropdownContainer.children()[1].click();
	expect( $anchor.text() ).to.equal("Female");
    });
});
