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
	this.userFields = this.options.userFields;

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
	DropdownReplacer.replaceDropdowns($(".cta-container"));
	this.render();
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
		return item.value === '';
	    })
	    .filter(function(element, item) {
		return item.attr('set') && (item.attr('set') === 'true');
	    }).length === 0;

	if (DEBUG) {
	    console.log(`[setup/app.js::validateRequired]: value: ${fieldsFilled}`);
	}

	return fieldsFilled;
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

    attemptCreation: function(event) {
	if (DEBUG) {
	    console.log(`[setup/app.js::SetupView::attemptCreation]: Potential creation event...`);
	}

	if (event.keyCode && event.keyCode !== 13 ) {
	    return;
	} else {
	    $(this.el).find(".form-control").blur();
	}

	if (DEBUG) {
	    console.log(`[setup/app.js::SetupView::attemptCreation]: Attempting creation of user object.`);
	}

	var that = this;

	var displayWindow = function(modal) {
	    $.when($(that.el).append(modal.render().el)).then(function() {
		setTimeout(function(){
		    $(that.el).find(".begin-transparent").removeClass('begin-transparent');
		}, 50);
	    });
	};

	if (this.validateRequired()) {
	    console.log(this.getFields());
	    this.userFields.save(this.getFields(), {
		dataType: 'text',

		success: function(model, response) {
		    var modalItem = new ModalView({
			header: "Nice",
			message: "You made an account! Press okay to go to the login page.",
			isDangerous: false,
			closeFn: function() {
			    console.log("Hello");
			    window.location.href = '/login';
			}
		    });


		    displayWindow(modalItem);
		},

		error: function(model, response) {
		    if (response.responseText === "Error") {
			displayWindow(produceModal("Oops", "An error occured on our server, maybe you want to try again later?", true));
		    } else if (response.responseText === "Conflict") {
			displayWindow(produceModal("Oops", "A user with this account name already exists!", true));
		    } else if (response.responseText === "Malformed") {
			displayWindow(produceModal("Oops", "The data you sent us was malformed!", true));
		    } else {
			displayWindow(produceModal("Oops", "An unknown error occured on our server, maybe you want to try again later?", true));
		    }
		},
	    });
	} else {
	    displayWindow(produceModal("Oops", "All fields are required.", true));
	}
    }
});

$(document).ready(function() {
    userFields = new UserSetupModel();

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
	user: userFields
    });
});
