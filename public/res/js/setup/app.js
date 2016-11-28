/*globals $, Dropdown, Modal*/
var DEBUG = true;
console.log(`Setting DEBUG to ${DEBUG} in setup/app.js.`);

var SetupView = Backbone.View.extend({
    // The tag that represents the
    // hook that this view is associated
    // with.

    // UI Components.
    $username: undefined,
    $password: undefined,
    $genderSelector: undefined,
    $goalSelector: undefined,
    $activitySelector: undefined,
    $weight: undefined,
    $height: undefined,
    $age: undefined,

    // Models.
    userFields: undefined,

    initialize: function(attrs) {
	if (DEBUG) {
	    console.log("[setup/app.js::SetupView::initialize]: Initializing object...");
	}

	this.el = this.options.applicationContainer;
	this.options = attrs;

	// The user model that will be passed back and
	// fourth between the server.
	this.userFields = this.options.user;

	// The actual user interface fields (as JQuery
	// selectors). We can use these to synchronize
	// the user model introduced after this and
	// send it to the server for analysis and
	// creation.
	this.$username = this.options.$username;
	this.$password = this.options.$password;
	this.$genderSelector = this.options.$genderSelector;
	this.$goalSelector = this.options.$goalSelector;
	this.$activitySelector = this.options.$activitySelector;
	this.$weight = this.options.$weight;
	this.$height = this.options.$height;
	this.$age = this.options.$age;

	_.bindAll(this, 'render');
	this.render();

	var that = this;

	$(this.el).find(".btn-create").click(function(event) {
	    that.attemptCreation(event);
	});

	$(this.el).keypress(function(event) {
	    console.log($('body').has('.window'));
	    if (event.which === 13 ) {
		if (($('body').has('.window').length == 0)) {
		    that.attemptCreation(event);
		} else {
		    if (($(".top-text").has('.success-text').length === 0)) {
			$(".modal").parent().remove();
		    } else {
			window.location.href = '/login';
		    }
		}
	    } 
	});
    },

    // validateRequired() takes the global DOM and checks for all DOM
    // nodes with the required class, following this it filters the
    // nodes for ANY item that is not equal to ''. If any nodes are
    // in the resultant list, our inputs will not be satisfied.
    validateRequired: function() {
	if (DEBUG) {
	    console.log("[setup/app.js::validateRequired]: Validating fields...");
	}

	var fieldsFilled = $(this.el)
	    .find('.required')
	    .filter(function(element, item) {
		return ($(item).attr('set') === 'false')|| item.value === '';
	    })

	if (DEBUG) {
	    console.log(`[setup/app.js::validateRequired]: value: ${fieldsFilled.toString()}`);
	    console.log(`[setup/app.js::validateRequired]: length: ${fieldsFilled.length}`);
	    for (var i = 0; i < fieldsFilled.length; i++) {
		console.log(`    [setup/app.js::validateRequired]: ${fieldsFilled[i.text]}`);
	    }
	}

	return fieldsFilled.length === 0;
    },

    events: {
	"click .btn-create": "attemptCreation",
	"keyup .form-control": "attemptCreation"
    },

    getFields: function() {
	return {
	    username: this.$username.val(),
	    password: this.$password.val(),
	    weight: Number(this.$weight.val()),
	    height: Number(this.$height.val()),
	    age: Number(this.$age.val()),
	    bmi: calculateBmi(Number(this.$weight.val()), Number(this.$height.val())),
	    bmr: calculateBmr(Number(this.$weight.val()), Number(this.$height.val()), this.$genderSelector.text(), Number(this.$age.val())),
	    activitySelector: this.$activitySelector.text(),
	    genderSelector: this.$genderSelector.text(),
	    goalSelector: this.$goalSelector.text(),
	    dailyCalories: calculateDailyCalories(
		calculateBmr(Number(this.$weight.val()),
				Number(this.$height.val()),
				this.$genderSelector.text(),
				Number(this.$age.val())),
		this.$activitySelector.text(),
		this.$goalSelector.text())
	}
    },

    createUser: function() {
	// Unfourtunately, JavaScript does not allow lexical scoping of
	// variables (at least in ES5, if we were using ES6, we could
	// use let in conjunction with arrow functions to fix this,
	// but here we must do the relatively hacky solution of defining
	// a "that", which is relatively idiomatic.
	var that = this;

	if (this.validateRequired()) {

	    // DEBUG DISPLAY: TO BE REMOVED IN PRODUCTION BUILD
	    if (DEBUG) {
		console.log(`[setup/app.js::SetupView::attemptCreation]: Validation passed.`);
	    }
	    // !DEBUG DISPLAY
	    var userFields;

	    try {
		userFields = this.getFields();
		if (DEBUG) {
		    console.log(userFields);
		}
	    } catch(e) {
		produceModal("Oops", "All fields are required.", true).display($(this.el));
		return;
	    }

	    console.log(userFields);
	    // Save the model using this.getFields(): We could actually automatically
	    // update our model on form changes and we wouldn't even have to use
	    // the "this.getFields() functionality, and in fact we could fully delete
	    // it.
	    that.userFields.save(userFields, {
		dataType: 'text',

		success: function(model, response) {
		    console.log(response);

		    // DEBUG DISPLAY: TO BE REMOVED IN PRODUCTION BUILD
		    if (DEBUG) {
			console.log(`[setup/app.js::SetupView::attemptCreation]: Successful creation of user object.`);
			console.log(`[setup/app.js::SetupView::attemptCreation]: ${this.userFields}.`);
		    }
		    // !DEBUG DISPLAY

		    var successModal = new ModalView({
			header: "Nice",
			message: "You made an account! Press okay to go to the login page.",
			isDangerous: false,
			closeFn: function() {
			    window.location.href = '/login';
			}
		    });

		    successModal.display($(that.el));
		},

		error: function(model, response) {
		    if (response.responseText === "Error") {
			produceModal("Oops", "An error occured on our server, maybe you want to try again later?", true).display($(that.el));
		    } else if (response.responseText === "Conflict") {
			produceModal("Oops", "A user with this account name already exists!", true).display($(that.el));
		    } else if (response.responseText === "Malformed") {
			produceModal("Oops", "The data you sent us was malformed!", true).display($(that.el));
		    } else {
			produceModal("Oops", "An unknown error occured on our server, maybe you want to try again later?", true).display($(that.el));
		    }
		},
	    });
	} else {
	    produceModal("Oops", "All fields are required.", true).display($(this.el));
	}

    },

    attemptCreation: function(event) {
	// DEBUG DISPLAY: TO BE REMOVED IN PRODUCTION BUILD
	if (DEBUG) {
	    console.log(`[setup/app.js::SetupView::attemptCreation]: Potential creation event...`);
	}
	// !DEBUG DISPLAY

	// Here we check to see if the user has pressed the enter key, or some other.
	// In the case that an enter key is pressed, the creation function is promptly
	// returned, otherwise we take the focus off of the form control to prepare
	// focus to be on the modal.
	if (event.keyCode && event.keyCode !== 13 ) {
	    return;
	} else {
	    $(this.el).find(".form-control").blur();
	}

	// DEBUG DISPLAY: TO BE REMOVED IN PRODUCTION BUILD
	if (DEBUG) {
	    console.log(`[setup/app.js::SetupView::attemptCreation]: Attempting creation of user object.`);
	    console.log(`[setup/app.js::SetupView::attemptCreation]: User object: ${this.userFields}`);
	}
	// !DEBUG DISPLAY

	// Create a user object.
	this.createUser();
    }
});

$(document).ready(function() {
    // Replace all the dropdowns on our application before we
    // actually create the app view.
    DropdownReplacer.replaceDropdowns($(".cta-container"));

    // Create user object.
    userObject = new UserModelSetup();

    // Create actual page of application.
    app = new SetupView({
	applicationContainer: $("body"),
	$username: $("#username"),
	$password: $("#password"),
	$genderSelector: $("#gender"),
	$goalSelector: $("#goal"),
	$activitySelector: $("#activity-level"),
	$weight: $("#weight"),
	$height: $("#height"),
	$age: $("#age"),
	user: userObject
    });
});
