var EntryView = Backbone.View.extend({
    el: $("body"),

    // UI Components.

    // Food Entry Tab
    $foodName: undefined,
    $carbs: undefined,
    $fats: undefined,
    $proteins: undefined,
    $foodDate: undefined,
    $autofill: undefined,
    $submit: undefined,

    // Suggested items
    $suggestedContainer: undefined,

    // Weight Entry
    $currentWeight: undefined,
    $weightDate: undefined,
    $submitWeight: undefined,

    // Models
    foodAPI: undefined,
    foodEntry: undefined,

    initialize: function(attrs) {
	this.options = attrs;
	this.el = this.options.applicationContainer;

	// UI Elements which we will use to
	// enter data.
	this.$foodName = this.options.$foodName;
	this.$carbs = this.options.$carbs;
	this.$fats = this.options.$fats;
	this.$proteins = this.options.$proteins;
	this.$foodDate = this.options.$foodDate;
	this.$autofill = this.options.$autofill;
	this.$submitEntry = this.options.$submitEntry;
	this.$suggestedContainer = this.options.$suggestContainer;
	this.$currentWeight = this.options.$currentWeight;
	this.$weightDate = this.options.$weightDate;
	this.$submitWeight = this.options.$submitWeight;

	this.foodAPI = this.options.foodAPI;
	this.foodEntry = this.options.foodEntry;

	_.bindAll(this, 'render');
	this.render();

	this.foodAPI.view = this;
	this.foodAPI.bind("attributesChanged", this.displayItems);

	this.fillRecents();

	var that = this;

	$(this.$autofill).click(function() {
	    that.queryFoodName();
	});

	$(this.$submitEntry).click(function() {
	    that.submitFoodEntry();
	});

	$(this.$submitWeight).click(function() {
	    that.submitWeightEntry();
	});

	var requiredItems = [this.$carbs, this.$fats, this.$proteins];

	requiredItems.map(function(item) {
	    item.on("input", function(){
		that.validateFoodInput();
	    });
	});
    },

    validateFoodInput: function() {
	var requiredItems = [this.$carbs, this.$fats, this.$proteins];

	requiredItems.map(function(item) {
	    item.removeClass('danger');
	});

	var badInputs = requiredItems
	    .filter(function(item) {
		return (item.val() === '');
	    });

	badInputs.map(function(item){
	    $(item).addClass('danger');
	});

	if (badInputs.length === 0) {
	    $('#submit-entry').removeAttr('disabled');
	    return true;
	} else {
	    $('#submit-entry').attr('disabled','disabled'); // will robinson
	    return false;
	}
    },

    submitFoodEntry: function() {
	var that = this;

	this.foodEntry.save(this.getFoodFields(), {
	    dataType: 'text',

	    success: function(model, response) {
		var successModal = new ModalView({
		    header: "Nice!",
		    message: "We got the entry!",
		    isDangerous: false
		});

		successModal.display($(that.el));

		that.resetFields();
		that.fillRecents();

		return true;
	    },

	    error: function(model, response) {
		var failureModal = new ModalView({
		    header: "Oops!",
		    message: "Some of the data you entered was malformed, try again!",
		    isDangerous: true
		});

		failureModal.display($(that.el));
		return false;
	    }
	});

	return true;
    },

    resetFields: function() {
	this.$foodName.val('');
	this.$carbs.val('');
	this.$fats.val('');
	this.$proteins.val('');
	$("#timestamp").val('');
	this.validateFoodInput();
    },

    getFoodFields: function() {
	var dateTime = this.$foodDate.val() || new Date();
	var foodName = this.$foodName.val() || "Unnamed";

	return {
	    name: foodName,
	    carbs: this.$carbs.val(),
	    fats: this.$fats.val(),
	    proteins: this.$proteins.val(),
	    date: dateTime
	};
    },
    displayItems: function(result) {
	this.$carbs.val(this.foodAPI.get("carbs"));
	this.$fats.val(this.foodAPI.get("fats"));
	this.$proteins.val(this.foodAPI.get("proteins"));
    },

    queryFoodName: function() {
	var that = this;
	if (this.$foodName.val().length > 2) {
	    var item = new FoodAPIModel({id: this.$foodName.val()});
	    item.fetch().then(function(){
		that.foodAPI = item;
		console.log(item);
		that.displayItems();
		that.validateFoodInput();
	    });
	} else {
	    produceModal("Oops", "You must enter at least 3 characters for autocomplete to function!", true).display($(this.el));
	}
    },

    fillRecents: function() {
	var that = this;
	$.get('/api/foods').done(function(foodArray){
	    var suggestionContainer = $('#recent-entries .row');
	    suggestionContainer.html('');
	    foodArray.forEach(function(foodName){
		var el = $('<div class="col-md-12 text-md-left m-y-1">')
		    .append($('<a href="#">').text(foodName));

		el.click(function(){
		    that.$foodName.val(foodName);
		    that.queryFoodName();
		});

		suggestionContainer.append(el);
	    });
	});
    },

    submitWeightEntry: function() {
	var weight = this.$currentWeight.val();
        var weightDate = this.$weightDate.val() || new Date();
	var that = this;

        if (!weight) {
	    produceModal("Oops", "You need to set a weight value.", true).display($(this.el));
        } else{
            var postData = {
                value: weight,
                timestamp: weightDate
            };
            
            $.post('/api/weight', postData).done(function(){
		produceModal("Nice", "Weight has been submitted", false).display($(that.el));
            });
        }
    }
});



$(document).ready(function(){
    DropdownReplacer.replaceDropdowns($("body"));

    // Create a user object.
    var foodAPI = new FoodAPIModel();
    var foodEntry = new FoodEntryModel();

    // Instantiate this page of the application.
    var app = new EntryView({
	applicationContainer: $("body"),

	// Food Entry Tab
	$foodName: $("#name"),
	$carbs: $("#carbs"),
	$fats: $("#fats"),
	$proteins: $("#proteins"),
	$foodDate: $("#timestamp"),
	$autofill: $("#auto-fill"),
	$submitEntry: $("#submit-entry"),

	// Suggested items
	$suggestedContainer: $("#recent-entries"),

	// Weight Entry
	$currentWeight: $("#weight"),
	$weightDate: $("#weight-date"),
	$submitWeight: $("#submit-weight"),

	// Models
	foodAPI: foodAPI,
	foodEntry: foodEntry
    });   
});
