var validateRequest = require('../../../app/utilities/integrity.js').validateRequest;
var serveFile = require('../../../app/utilities/serving.js').serveFile;
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
	    // Facade for mocking response objects.
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
	    // Facade for mocking response objects.
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
	    // Facade for mocking response objects.
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
	    // Facade for mocking response objects.
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

describe('File server', function() {
    function res() {
	this.status= {};

	this.set = function(content, type) {
	    this.status.content = content;
	    this.status.type = type;
	};

	this.sendFile = function(uri, options) {
	    this.status.uri = uri;
	    this.status.options = options;
	};
    };

    it('Should show proper data on input', function() {
	res = new res;
	serveFile("/index.html", res);

	expect(res.status.content).to.equal("Content-Type");
	expect(res.status.type).to.equal("text/html");
	expect(res.status.uri).to.equal("/index.html");
	expect(res.status.options.root).to.equal(".//public");
	expect(res.status.options.dotfiles).to.equal("allow");
	expect(res.status.options.headers['x-sent']).to.equal(true);
    });
});

// Note because database manipulation is handled by Redis
// it is not neccessary to go about testing it: This is
// covered by our functional and integration tests. On
// the otherhand debug does not need to be tested because
// it is simply a way for me to observe variables without
// stepping into the debugger: because it does not have any
// side effects on the state of, no tests are
// the application, no tests are neccessary.
