/*globals $, Dropdown, Modal*/

var SetupView = Backbone.View.extend({
    // The tag that represents the
    // hook that this view is associated
    // with.
    el: $("body"),

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

	// Stack of current modals.
	this.modals = [];

	_.bindAll(this, 'render');
	this.render();

	var that = this;

	$(this.el).find(".btn-create").click(function(event) {
	    $(".btn-create").blur();
	    that.attemptCreation(event);
	});

	$(document).keypress(function(event) {
	    if (event.which === 13 ) {
		if (($('body').has('.window').length === 0)) {
		    that.attemptCreation(event);
		} 
	    } 
	});
    },

    // validateRequired() takes the global DOM and checks for all DOM
    // nodes with the required class, following this it filters the
    // nodes for ANY item that is not equal to ''. If any nodes are
    // in the resultant list, our inputs will not be satisfied.
    validateRequired: function() {
	var fieldsFilled = $(this.el)
	    .find('.required')
	    .filter(function(element, item) {
		return ($(item).attr('set') === 'false')|| item.value === '';
	    });

	return fieldsFilled.length === 0;
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
	};
    },

    attemptCreation: function(event) {
	if (!this.validateRequired()) {
	    produceModal("Oops", "All fields are required.", true).display($(this.el));
	    return false;
	}


	var fields = this.getFields();
	var that = this;

	// Save the model using this.getFields(): We could actually automatically
	// update our model on form changes and we wouldn't even have to use
	// the "this.getFields() functionality, and in fact we could fully delete
	// it.
	this.userFields.save(fields, {
	    dataType: 'text',

	    success: function(model, response) {
		var successModal = new ModalView({
		    header: "Nice",
		    message: "You made an account! Press okay to go to the login page.",
		    isDangerous: false,
		    closeFn: function() {
			window.location.href = '/login';
		    }
		});

		successModal.display($(that.el));
		that.currentModals.push(successModal);
		return true;
	    },

	    error: function(model, response) {
		var modal;

		if (response.responseText === "Error") {
		    modal = produceModal("Oops", "An error occured on our server, maybe you want to try again later?", true);
		    modal.display($(that.el));
		    that.currentModals.push(modal);
		    return false;
		} else if (response.responseText === "Conflict") {
		    modal = produceModal("Oops", "A user with this account name already exists!", true);
		    modal.display($(that.el));
		    that.currentModals.push(modal);
		    return false;
		} else if (response.responseText === "Malformed") {
		    modal = produceModal("Oops", "The data you sent us was malformed!", true);
		    modal.display($(that.el));
		    that.currentModals.push(modal);
		    return false;
		} else {
		    modal = produceModal("Oops", "An unknown error occured on our server, maybe you want to try again later?", true);
		    modal.display($(that.el));
		    that.currentModals.push(modal);
		    return false;
		}
	    }
	});

	return true;
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
