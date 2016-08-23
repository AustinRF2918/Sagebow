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
    var max = moment();
    
    var min = max.clone().subtract(1,'week');
    
    $.get('/api/consumption',function(consumptionEvents){
    	var days = [],
    		calories = [];
    	
    	for(var consumptionEvent of consumptionEvents){
    		days.push(consumptionEvent.timestamp);
    		calories.push(consumptionEvent.calories);
    	}
    	
    	var startBarGraph = FingBarGraph($("#data-plot"), "Weekly Caloric Intake", days, calories);
    });

    //If we click something else, delete $("#data-plot") and remake
    //start bar graph..

    var startPieGraph = FingPieGraph($("#consumption-plot"), "Weekly Caloric Intake", DailyCalorieCount);
});




