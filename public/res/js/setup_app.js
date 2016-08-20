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

	// var successfulCreationModal = (function() {new FingModal('Nice!', 'Your information has been saved to our database!', false)})();
	var unsuccessfulHead = 'Oh no!';
	var successfulHead = 'Nice!';
	
	var successMsg = 'Your information has been saved to our database!',
		errorMsg = 'We encountered an internal error, sorry :(.',
		existsMsg = 'A user with this name already exists!',
		malformedMsg = 'You entered malformed data! Your name/password must have 6 characters and a number, and all attribute fields must have decimal numbers!',
		incompleteMsg = 'You entered incomplete information, please fill out all the forms.',
		generalErrorMsg = 'A general error appeared.';
	
	
	$(".btn-login").on('click', function() {
		if (checkInputs()) {
			var username = $('#username').val(),
				password = $('#password').val(),
				weight = Number($('#weight').val()),
				height = Number($('#height').val()),
				bmi = calculateBmi(weight, height),
				activityLevel = $('#activity-level').text(),
				gender = $('#gender').text(),
				age = Number($('#age').val()),
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
				switch(msg){
					case 'error': 
						new FingModal(unsuccessfulHead, errorMsg, true).show(); break;
					case 'exists': 
						new FingModal(unsuccessfulHead, existsMsg, true).show(); break;
					case 'malformed': 
						new FingModal(unsuccessfulHead, malformedMsg, true).show(); break;
					case 'incomplete': 
						new FingModal(unsuccessfulHead, incompleteMsg, true).show(); break;
					case 'success': 
						var modal = new FingModal(successfulHead, successMsg, false);
						modal.button.click(function(){
							window.location.pathname='/login';
						});
						modal.show();
						break;
					default:
						modal = new FingModal(unsuccessfulHead, generalErrorMsg, true);
						break;
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