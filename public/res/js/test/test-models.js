if (!(typeof window != 'undefined' && window.document)) {
    var vm = require('vm');
    var fs = require('fs');
    vm.runInThisContext(fs.readFileSync('./ui/modal.js'));
    var chai = require('chai');
}
var expect = chai.expect;


describe("User models function.", function() {
    describe("UserModelSetup functionality.", function() {
	var userObject = new UserModelSetup();

	it ('Should instantiate with proper values.', function() {

	    expect( userObject.username ).to.equal( "" );
	    expect( userObject.password ).to.equal( "" );
	    expect( userObject.weight ).to.equal( 0 );
	    expect( userObject.height ).to.equal( 0 );
	    expect( userObject.age ).to.equal( 0 );
	    expect( userObject.bmi ).to.equal( 0 );
	    expect( userObject.bmr ).to.equal( 0 );
	    expect( userObject.activitySelector ).to.equal( 0 );
	    expect( userObject.goalSelector ).to.equal( 0 );
	    expect( userObject.genderSelector ).to.equal( 0 );
	    expect( userObject.dailyCalories ).to.equal( 0 );
	});

	it ('Should map to the proper URL.', function() {
	    expect( userObject.url()).to.equal( "/setup" );
	});
    });

    describe("UserModelLogin functionality.", function() {
	var userObject = new UserModelLogin();

	it ('Should instantiate with proper values.', function() {

	    expect( userObject.username ).to.equal( "" );
	    expect( userObject.password ).to.equal( "" );
	});

	it ('Should map to the proper URL.', function() {
	    expect( userObject.url()).to.equal( "/login" );
	});
    });

    describe("UserModelDeletion functionality.", function() {
	var userObject = new UserModelDeletion();

	it ('Should instantiate with proper values.', function() {

	    expect( userObject.username ).to.equal( "" );
	    expect( userObject.password ).to.equal( "" );
	});

	it ('Should map to the proper URL.', function() {
	    expect( userObject.url()).to.equal( "/delete" );
	});
    });
});
