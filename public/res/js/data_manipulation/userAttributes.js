// This script is for calculating various facts about
// a user, specifically their BMR, BMI, and daily
// calories. It functions primarily as the business
// logic module for client side calculations of a user's
// object.

// TODO: WRITE DOCS
function calculateBmi(weight, height) {
    // Recall the formula of BMI:
    // BMI = ( Weight in Pounds / ( Height in inches x Height in inches ) ) * 703
    return (weight / ((height * 12) * (height * 12))) * 703;
}

// TODO: WRITE DOCS
function calculateBmr(weight, height, gender, age) {
    if (gender.toLowerCase() === 'male') {
	// BMR for men: 655 + (4.35 x weight in pounds) + (4.7 x height in inches) - (4.7 x age in years)
	return 655 + (4.35 * weight) + (4.7 * (height * 12)) - (4.7 * age);
    } else if (gender.toLowerCase() === 'female') {
	// BMR for women: 66 + (6.23 x weight in pounds) + (12.7 x height in inches) - (6.8 x age in years)
	return 66 + (6.23 * weight) + (12.7 * (height * 12)) - (6.8 * age);
    } else {
	// This error is thrown in the case that neither gender is passed.
	throw new Error("calculateBmr(weight, height, gender, age): gender must be either male or female.");
    }
}

// TODO: WRITE DOCS
function calculateDailyCalories(bmr, activityLevel, goal) {
    var goalAdj;

    var activityMap = {
	    // If you are sedentary or mostly sedentary multiply your BMR by 1.0-1.39 
	    'sedentary': bmr * 1.39,
	    // If you are lightly active (you do 30-60 minutes of easy physical activity each day), multiply your BMR by 1.4-1.59
	    'lightly': bmr * 1.59,
	    // If you are moderately active (you do 60 minutes of moderate physical activity each day) multiply your BMR by 1.6-1.89
	    'moderately': bmr * 1.89,
	    // If you are very active multiply your BMR by 1.9-2.5. Very active people do at least 60 minutes of moderate physical activity each day plus 60 minutes of vigorous activity or do at least 120 minutes of moderate activity each day.
	    'very': bmr * 2.5
    };

    if (goal.toLowerCase() === "weight loss") {
	return activityMap[activityLevel.split(' ')[0].toLowerCase()] * 0.8;
    } else if (goal.toLowerCase() === "bodybuilding") {
	return activityMap[activityLevel.split(' ')[0].toLowerCase()] * 1.2;
    } else if (goal.toLowerCase() === "toning") {
	return activityMap[activityLevel.split(' ')[0].toLowerCase()] * 1.0;
    } else {
	throw new Error("calculateDailyCalories(bmr, activityLevel, goal): goal must be either weight loss, bodybuilding, or toning.");
    }
}

