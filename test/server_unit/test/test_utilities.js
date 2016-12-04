var validateRequest = require('../../../app/utilities/integrity.js').validateRequest;
var expect = require('chai').expect;


describe('Integrity Checker', function() {
    it('Should successfully give us data if our input is good.', function() {
	var data = validateRequest(["username", "password"], {
	    body: {"username": "hello", "password": "world"}
	});

	expect(data["username"]).to.equal("hello");
	expect(data["password"]).to.equal("world");
    });

    it('Should successfully give us data if our input is good including parameters.', function() {
	var data = validateRequest(["username", "password"], {
	    body: {"username": "hello", "password": "world"},
	    parameters: {"input": "test"}
	});

	expect(data["username"]).to.equal("hello");
	expect(data["password"]).to.equal("world");
	expect(data["input"]).to.equal("test");
    });
});
