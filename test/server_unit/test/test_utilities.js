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
	var data = validateRequest(["username", "password", "input"], {
	    params: {"input": "test"},
	    body: {"username": "hello", "password": "world"}
	});

	expect(data["username"]).to.equal("hello");
	expect(data["password"]).to.equal("world");
	expect(data["input"]).to.equal("test");
    });

    it('Should not map variables that werent neccessary required.', function() {
	var data = validateRequest(["username", "password", "input"], {
	    params: {"input": "test", "output": "what"},
	    body: {"username": "hello", "password": "world", "credential": "is"}
	});

	expect(data["username"]).to.equal("hello");
	expect(data["password"]).to.equal("world");
	expect(data["input"]).to.equal("test");
	expect(data["output"]).to.not.equal("what");
	expect(data["credential"]).to.not.equal("is");
    });

    it('Should not map variables that werent neccessary required body.', function() {
	var data = validateRequest(["username", "password", "input"], {
	    params: {"input": "test", "output": "what", "input": "what"},
	    body: {"password": "world", "credential": "is"}
	}, {
	    status: function(param) {
		return {
		    send: function(param) {
		    }
		};
	    }
	});

	expect(data).to.equal(null);
    });

    it('Should not map variables that werent neccessary required params.', function() {
	var data = validateRequest(["username", "password", "input"], {
	    params: {"output": "what"},
	    body: {username: "hello", "password": "world", "credential": "is"}
	}, {
	    status: function(param) {
		return {
		    send: function(param) {
		    }
		};
	    }
	});

	expect(data).to.equal(null);
    });

    it('Should not map variables that werent neccessary required both.', function() {
	var data = validateRequest(["username", "password", "input"], {
	    params: {"output": "what"},
	    body: {"password": "world", "credential": "is"}
	}, {
	    status: function(param) {
		return {
		    send: function(param) {
		    }
		};
	    }
	});

	expect(data).to.equal(null);
    });

    it('Should pass back empty object if no parameters required.', function() {
	var data = validateRequest([], {
	    params: {"output": "what"},
	    body: {"password": "world", "credential": "is"}
	}, {
	    status: function(param) {
		return {
		    send: function(param) {
		    }
		};
	    }
	});

	expect(data).to.deep.equal({});
    });
});
