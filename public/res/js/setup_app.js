/*globals $, Dropdown, Modal*/
function checkInputs() {

	var inputsSatisfied = $('input.required').filter(function(element) {
		return !!element.value;
	}).length === 0;

	return inputsSatisfied && !$('.btn-gender').text().match(/gender/i) && !$('.btn-goal').text().match(/goal/i);
}

function toInches(feet) {
	return feet * 12;
}

function calculateBmi(weight, height) {
	//BMI = ( Weight in Pounds / ( Height in inches x Height in inches ) ) x 703
	return (weight / (toInches(height) * toInches(height))) * 703;
}

function calculateBmr(weight, height, gender, age) {
	if (gender === 'douche') {
		return 655 + (4.35 * weight) + (4.7 * toInches(height)) - (4.7 * age);
	}
	else if (gender === 'hoe') {
		return 66 + (6.23 * weight) + (12.7 * toInches(height)) - (6.8 * age);
	}
	//     BMR for men: 655 + (4.35 x weight in pounds) + (4.7 x height in inches) - (4.7 x age in years)
	// BMR for women: 66 + (6.23 x weight in pounds) + (12.7 x height in inches) - (6.8 x age in years)
	// multiply your BMR by an activity factor to determine your caloric needs. Each activity category listed below has a range. Choose a number based on where you fall in that range.
}

function calculateDailyCalories(bmr, activityLevel) {
	var activityMap = {
		'sedentary': bmr * 1.39,
		'lightly': bmr * 1.59,
		'moderately': bmr * 1.89,
		'very': bmr * 2.5
	};
	return activityMap[activityLevel.split(' ')[0].toLowerCase()];
	// If you are sedentary or mostly sedentary multiply your BMR by 1.0-1.39 
	// If you are lightly active (you do 30-60 minutes of easy physical activity each day), multiply your BMR by 1.4-1.59
	// If you are moderately active (you do 60 minutes of moderate physical activity each day) multiply your BMR by 1.6-1.89
	// If you are very active multiply your BMR by 1.9-2.5. Very active people do at least 60 minutes of moderate physical activity each day plus 60 minutes of vigorous activity or do at least 120 minutes of moderate activity each day.
}

$(document).ready(function() {
	var displayModal = Modal("modal-incomplete-data", "btn-incomplete-data-close");

	var goalDropdown = Dropdown("btn-goal", "goal-selector");
	goalDropdown.setMode("replace");
	goalDropdown.pushItem("dropdown-weight-loss");
	goalDropdown.pushItem("dropdown-maintainence");
	goalDropdown.pushItem("dropdown-bodybuilding");
	goalDropdown.buildButton();

	var genderDropdown = Dropdown("btn-gender", "gender-selector");
	genderDropdown.setMode("replace");
	genderDropdown.pushItem("dropdown-female");
	genderDropdown.pushItem("dropdown-male");
	genderDropdown.buildButton();

	var activityDropdown = Dropdown("btn-activity", "activity-selector");
	activityDropdown.setMode("replace");
	activityDropdown.pushItem("dropdown-very-active");
	activityDropdown.pushItem("dropdown-moderately-active");
	activityDropdown.pushItem("dropdown-lightly-active");
	activityDropdown.pushItem("dropdown-sedentary");
	activityDropdown.buildButton();

	$(".btn-modal-incomplete-input-reject").on('click', function() {
		$(".modal-incomplete-input").toggleClass("modal-incomplete-input-hidden");
	});

	$(".btn-modal-internal-error-reject").on('click', function() {
		$(".modal-internal-error").toggleClass("modal-internal-error-hidden");
	});

	$(".btn-incomplete-data-close").on('click', function() {
		$(".modal-incomplete-data").addClass("modal-incomplete-data-hidden");
	});
	
	$(".btn-internal-error-close").on('click', function() {
		$(".modal-internal-error").addClass("modal-internal-error-hidden");
	});
	$(".btn-login").on('click', function() {
		if (checkInputs()) {
			var username = $('#username').val(),
				password = $('#password').val(),
				weight = $('#weight').val(),
				height = $('#height').val(),
				bmi = calculateBmi(weight, height),
				activityLevel = $('#activity-level').text(),
				gender = $('#gender').text(),
				age = $('#age').val(),
				bmr = calculateBmr(weight, height, gender, age),
				dailyCalories = calculateDailyCalories(bmr, activityLevel);
			$.post("/setup", {
				username: username,
				password: password,
				weight: weight,
				bmi: bmi,
				dailyCalories: dailyCalories,
				'dataType': "text"
				
			}).done(function(msg) {
				console.log(msg);
				switch(msg){
					case 'error': $(".modal-internal-error").removeClass("modal-internal-error-hidden"); break;
					//case 'exists': ; break;
					//case 'malformed': ; break
					case 'incomplete': $(".modal-incomplete-data").removeClass("modal-incomplete-data-hidden"); break;
					//case 'success': ; break;
				}
			});
		} else {
			$(".modal-incomplete-data").removeClass("modal-incomplete-data-hidden");
		}
	});

	$("input").keydown(function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
		}
	});
});