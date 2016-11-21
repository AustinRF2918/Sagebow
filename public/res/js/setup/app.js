/*globals $, Dropdown, Modal*/

function checkInputs() {
	
}

// Create a general business logic library.
function toInches(feet) {
	return feet * 12;
}

function calculateBmi(weight, height) {
	//BMI = ( Weight in Pounds / ( Height in inches x Height in inches ) ) x 703
	return (weight / (toInches(height) * toInches(height))) * 703;
}

function calculateBmr(weight, height, gender, age) {
	if (gender === 'Male') {
		return 655 + (4.35 * weight) + (4.7 * toInches(height)) - (4.7 * age);
	}
	else if (gender === 'Female') {
		return 66 + (6.23 * weight) + (12.7 * toInches(height)) - (6.8 * age);
	}
	//     BMR for men: 655 + (4.35 x weight in pounds) + (4.7 x height in inches) - (4.7 x age in years)
	// BMR for women: 66 + (6.23 x weight in pounds) + (12.7 x height in inches) - (6.8 x age in years)
	// multiply your BMR by an activity factor to determine your caloric needs. Each activity category listed below has a range. Choose a number based on where you fall in that range.
}

function calculateDailyCalories(bmr, activityLevel, goal) {
	var activityMap = {
		'sedentary': bmr * 1.39,
		'lightly': bmr * 1.59,
		'moderately': bmr * 1.89,
		'very': bmr * 2.5
	};
	var goalAdj = 1;
	if(goal === "Weight Loss"){
		goalAdj = 0.8;
	}
	if(goal === "Bodybuilding"){
		goalAdj = 1.2;
	}
	return activityMap[activityLevel.split(' ')[0].toLowerCase()] * goalAdj;
	// If you are sedentary or mostly sedentary multiply your BMR by 1.0-1.39 
	// If you are lightly active (you do 30-60 minutes of easy physical activity each day), multiply your BMR by 1.4-1.59
	// If you are moderately active (you do 60 minutes of moderate physical activity each day) multiply your BMR by 1.6-1.89
	// If you are very active multiply your BMR by 1.9-2.5. Very active people do at least 60 minutes of moderate physical activity each day plus 60 minutes of vigorous activity or do at least 120 minutes of moderate activity each day.
}

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
	    this.render();
	},

	validateRequired: function() {
	    var inputsSatisfied = $(this.el)
		.find('.required')
		.filter(function(element, item) {
		    return item.value === '';
	    }).length === 0;

	    console.log($('#gender').attr('set'));

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
			displayWindow(produceModal("Nice", "You made an account! Press okay to go to the login page."));
			displayWindow(goodModal);
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
		var incompleteFieldsModal = produceModal("Oops", "All fields are required.", true);
		displayWindow(incompleteFieldsModal);
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
