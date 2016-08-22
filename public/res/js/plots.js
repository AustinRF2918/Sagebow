var FingBarGraph = function($ctx, headerTxt, days, calories) {
    return (new Chart($ctx, {
	type: 'bar',
	data: {
	    labels: days,
	    datasets: [{
		label: 'Weekly Caloric Intake',
		data: calories,
		backgroundColor: '#B71C1C',
		borderColor: 'rgba(0, 0, 0, 0.9)',
		borderWidth: 1.5
	    }]
	},
	options: {
	    scales: {
		yAxes: [{
		    ticks: {
			beginAtZero:true
		    }
		}]
	    }
	}
    }));
};

var FingPieGraph = function($ctx, headerTxt, rationalNutrient) {
    return (new Chart($ctx, {
	type: 'pie',
	data: {
	    labels: ["Protein", "Carbs", "Fat"],
	    datasets: [{
		label: 'Current Calorie Intake',
		data: [rationalNutrient.protein, rationalNutrient.carbs, rationalNutrient.fat],
		backgroundColor: ['#B71C1C',
				  '#880E4F',
				  '#4A148C'],
		borderColor: 'rgba(255, 99, 132, 0.3)',
		borderWidth: 1.5
	    }]
	},
	options: {
	    scales: {
		yAxes: [{
		    ticks: {
			beginAtZero:true
		    }
		}]
	    }
	}
    }));
};

$(document).ready(function() {
    var userCaloricObject = 
    {"1": "1600",
    "2": "2000",
    "3": "1800",
    "4": "2300",
    "5": "1400",
    "6": "1900",
     "7": "2000"};

    var days = [1, 2, 3, 4, 5, 6, 7];
    var calories = [2000, 2200, 2300, 4000, 2300, 3000, 3000];

    var DailyCalorieCount = new NutrientRatio(200, 100, 90);

    var startBarGraph = FingBarGraph($("#data-plot"), "Weekly Caloric Intake", days, calories);
    var startPieGraph = FingPieGraph($("#consumption-plot"), "Weekly Caloric Intake", DailyCalorieCount);
});




