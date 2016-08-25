/*globals $, Chart, moment*/
var consumptionData = [];
var currentNutrient = "calories";
var currentTimespan = "week";

function reduce(array, operation, initial){
	var finalResult = initial;
	for(var element of array){
		finalResult = operation(finalResult,element);
	}
	return finalResult;
};

var FingBarGraph = function($ctx, headerTxt, days, data) {
	$('#data-plot canvas').remove();
	$('#data-plot').append($('<canvas width="345" height="172" style="width: 345px; height: 172px;">'));
    return (new Chart($('#data-plot canvas'), {
		type: 'bar',
		data: {
		    labels: days,
		    datasets: [{
			label: headerTxt,
			data: data,
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
		data: [rationalNutrient.proteins, rationalNutrient.carbs, rationalNutrient.fats],
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

function extractMetric(key, unit){
	var min = moment().subtract(1, unit);
	return consumptionData.map(function(el){
		var time = new Date(el.timestamp);
		if(time >  min._d){
			return el[key];
		}else{
			console.log('DATE ESCAPE!');
			console.log(range.min);
			console.log(time);
			console.log(range.max);
		}
	});
};

function _classFromValue(num) {
	if (num >= 0 && num < 33.333) {
		return "not-even-close";
	} else if (num >= 33.333 && num < 66.666) {
		return "middle-close";
	} else {
		return "getting-close";
	}
};

function _applyClassToMeter($jObj) {
	$jObj.addClass(_classFromValue($jObj.attr("value")));
}

function stylizeBars() {
	_applyClassToMeter(($("#calories-goal")));
	_applyClassToMeter(($("#proteins-goal")));
	_applyClassToMeter(($("#fats-goal")));
	_applyClassToMeter(($("#carbs-goal")));
};

function summation(pre,cur){
	return pre+cur;
};

function updateBarGraph(){
	if(currentNutrient !== 'weight'){
		FingBarGraph($("#data-plot"), 
			"Your " + currentNutrient + " Intake for the "+currentTimespan, 
			extractMetric('timestamp', currentTimespan).map(function(ts){
				return moment(ts).format('MMM DD');
			}), 
			extractMetric(currentNutrient, currentTimespan));
	}else{
		$.get('/api/weight').done(function(weightEvents){
			var dates = weightEvents.map(function(el){
				return moment(el.timestamp).format('MMM DD');
			});
			
			var weights = weightEvents.map(function(el) {
				return el.weight;
			});
			
			FingBarGraph($('#data-plot'), "Your weight history for the " + currentTimespan, dates, weights);
		});
	}
}

$(document).ready(function() {
    $.get('/api/consumption',function(consumptionEvents){
    	consumptionData = consumptionEvents;
    	
    	updateBarGraph();
    	
    	if(consumptionData.length > 0){
    		var proteins = extractMetric('proteins','day'),
    			carbs = extractMetric('carbs','day'),
    			fats = extractMetric('fats','day');
    			
	    	var counts = new NutrientRatio(
	    		reduce(proteins,summation,0),
	    		reduce(carbs,summation,0),
	    		reduce(fats,summation,0));
	    	FingPieGraph($("#consumption-plot"), "Daily Caloric intake", counts);
	    	$.get('/api/diet').done(function(diet){
		    	var nutrients = new NutrientRatio(diet.dailyCalories, diet.goal);
	    		console.log(counts.fats * 9);
	    		console.log(nutrients.fats);
		    	$("#calories-goal").val(100*counts.calories/nutrients.calories);
			    $("#proteins-goal").val(100*(counts.proteins)/(nutrients.proteins / 4));
			    $("#fats-goal").val(100*(counts.fats)/(nutrients.fats / 9));
			    $("#carbs-goal").val(100*(counts.carbs)/(nutrients.carbs / 4));
		    	stylizeBars();
		    });
    	}
    });
    
    $(".dropdown-item").click(function(){
    	switch (this.innerHTML) {
    		case "Weekly": 
    			currentTimespan = "week";
    			break;
    		case "Monthly": 
    			currentTimespan = "month";
    			break;
    		case "Yearly": 
    			currentTimespan = "year";
    			break;
    		case "Calories": 
    			currentNutrient = "calories";
    			break;
    		case "Protein": 
    			currentNutrient = "proteins";
    			break;
    		case "Fat": 
    			currentNutrient = 'fats';
    			break;
    		case "Carbs": 
    			currentNutrient = 'carbs';
    			break;
    		case "Weight":
    			currentNutrient = 'weight';
    			break;
    	}
		updateBarGraph();
    });
});




