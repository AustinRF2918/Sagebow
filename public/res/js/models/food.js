var FoodAPIModel = Backbone.Model.extend({
    name: '',
    carbs: undefined,
    fats: undefined,
    proteins: undefined,

    url: function() {
	return '/api/query/' + this.id;
    },

    attributesChanged: function() {
	if (this.get('carbs') && this.get('fats') && this.get('proteins')) {
	    this.trigger("validated", true);
	} else {
	    this.trigger("validated", false);
	}
    }
});

var FoodEntryModel = Backbone.Model.extend({
    name: 'Unnamed',
    carbs: undefined,
    fats: undefined,
    proteins: undefined,
    date: undefined,

    url: function() {
	return '/api/consumption/';
    },

    attributesChanged: function() {
	if (this.get('name') === '') {
	    this.set('name', '');
	}
    }
});
