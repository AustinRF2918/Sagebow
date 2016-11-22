/*globals $, Dropdown, Modal*/

$(document).ready(function() {
    var UserModel = Backbone.Model.extend({
	defaults: {
	    username: '',
	    password: '',
	    weight: 0,
	    height: 0,
	    age: 0 ,
	    bmi: 0,
	    bmr: 0,
	    activitySelector: 0,
	    goalSelector: 0,
	    genderSelector: 0,
	    dailyCalories: 0,
	},

	url: function() {
	    return '/setup';
	}
    });

    userFields = new UserModel();

    var SetupView = Backbone.View.extend({
	el: $("body"),
	$username: undefined,
	$password: undefined,
	$genderSelector: undefined,
	$goalSelector: undefined,
	$activitySelector: undefined,
	$weight: undefined,
	$height: undefined,
	$age: undefined,

	initialize: function(attrs) {
	    this.options = attrs;

	    this.$username = this.options.$username;
	    this.$password = this.options.$password;
	    this.$genderSelector = this.options.$genderSelector;
	    this.$goalSelector = this.options.$goalSelector;
	    this.$activitySelector = this.options.$activitySelector;
	    this.$weight = this.options.$weight;
	    this.$height = this.options.$height;
	    this.$age = this.options.$age;

	    _.bindAll(this, 'render');
	    DropdownReplacer.replaceDropdowns();
	    this.render();
	},

	validateRequired: function() {
	    var inputsSatisfied = $(this.el)
		.find('.required')
		.filter(function(element, item) {
		    return item.value === '';
	    }).length === 0;

	    return inputsSatisfied &&
		   $('#gender').attr('set') === "true" &&
		   $('#goal').attr('set') === "true" &&
		   $('#activity-level').attr('set') === "true";
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
	    if (event.keyCode && event.keyCode !== 13 ) {
		return;
	    } else {
		$(this.el).find(".form-control").blur();
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
		userFields.save(this.getFields(), {
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
    })

    app = new SetupView({
	$username: $("#username"),
	$password: $("#password"),
	$genderSelector: $("#gender"),
	$goalSelector: $("#goal"),
	$activitySelector: $("#activity-level"),
	$weight: $("#weight"),
	$height: $("#height"),
	$age: $("#age")
    });
});
