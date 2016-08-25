/* globals $ */
function validateForm(){
    var valid = true;
    $('input.required').each(function(){
        var $this = $(this);
        if($this.val()==""){
            $this.addClass('danger');
            valid = false;
        }else{
            $this.removeClass('danger');
        }
    });
    
    if(valid){
        $('#submit-entry').removeAttr('disabled');
    }else{
        $('#submit-entry').attr('disabled','disabled'); // will robinson
    }
}

function getCurrentEntry() {
    return {
        name: $('#name').val(),
        carbs: $('#carbs').val(),
        fats: $('#fats').val(),
        proteins: $('#proteins').val(),
        date: $('#timestamp').val()
    }
}

function queryNutrientData(foodName) {
    new Promise(function queryBackend(onResolve, onReject){
        $.get('/api/query/'+foodName).done(function(foodData){
            onResolve(foodData);
        }).fail(function(){
            onReject();
        });
    }).then(function(foodData){
        // Fill in inputs with data
        $('#carbs').val(foodData.carbs);
        $('#fats').val(foodData.fats);
        $('#proteins').val(foodData.proteins);
        validateForm();
    }).catch(function(){
        // Show failure to get nutrient data
        new FingModal('Oops!','Couldn\'t find data for the food name you entered.', true).show();
    });
}

var suggestionPromise = new Promise(function(resolve){
    $.get('/api/foods').done(function(foodArray){
        resolve(foodArray);
    });
});

function queryUserNutrientData(foodName){
    $.get('/api/foods/'+foodName).done(function(foodData){
        // Fill in inputs with data
        $('#carbs').val(foodData.carbs);
        $('#fats').val(foodData.fats);
        $('#proteins').val(foodData.proteins);
        $('#name').val(foodData.name);
        validateForm();
    });
}

$(document).ready(function(){
    validateForm();
    
    $('input.required').change(validateForm);
    
    $('#submit-entry').click(function(){
        var data = getCurrentEntry();
        
        var name     = data.name,
            carbs    = data.carbs,
            fats     = data.fats,
            proteins = data.proteins,
            date     = data.date;
            
        var url = '/api/consumption?carbs='+carbs+'&fats='+fats+'&proteins='+proteins+'&';
        
        if(name)
            url += 'name='+name+'&';
            
        if(date)
            url += 'timestamp='+date;
        
        $.post(url).done(function(){
			new FingModal('Nice!', 'You entered a food submission!', false).show();
        }).fail(function(){
			new FingModal('Oh No!!', 'Your food data was in some way malformed! Please check that all the required entries (carbs, fats, and proteins) were submitted!', true).show();
        });
    });
    
    $('#auto-fill').click(function(){
        if (getCurrentEntry().name.length > 2){
          queryNutrientData(getCurrentEntry().name);
        } else {
			new FingModal('Oh No!', 'You must enter a name for us to attempt to autofill!', true).show();
        }
    });
    
    suggestionPromise.then(function(foodArray){
        var suggestionContainer = $('#recent-entries .row');
        suggestionContainer.html('');
        foodArray.forEach(function(foodName){
            var el = $('<div class="col-md-12 text-md-left m-y-1">')
                .append($('<a href="#">').text(foodName));
            el.click(function(){
                queryUserNutrientData(foodName);
            });
            suggestionContainer.append(el);
        });
    });
    
    $('#submit-weight').click(function(){
        var weight = $('#weight').val();
        var weightDate = $('#weightDate').val();
        if(!weight){
            new FingModal('Oops.','You need to set a weight value.', true).show();
        }else{
            console.log(weightDate);
            var postData = {
                value:weight,
                timestamp:weightDate
            };
            
            $.post('/api/weight',postData).done(function(){
              new FingModal('Nice.','Weight has been submitted.', false).show();
            });
        }
    });
    
    $.get('/api/lastUpdated').done(function(dateText){
        console.log(dateText);
        var lastDate = moment(dateText);
        var thresh = moment().subtract(2,'week');
        if(lastDate < thresh){
            new FingModal('Warning.',"You haven't submitted your weight in over two weeks! Please do so as soon as possible", true).show();
        }
    })
});