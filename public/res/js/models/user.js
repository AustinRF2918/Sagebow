// User setup model: This is a model that cooresponds to a user
// object that is currently being set-up. It is then passed to
// the setup end-point for construction of a slightly more
// complicated version that allows a user session to be constructed.
var UserModelSetup = Backbone.Model.extend({
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

    url: function() {
	return '/setup';
    }
});

// User login model: This is a model that cooresponds to a user
// object that is currently being set-up. It is then passed to
// the setup end-point for construction of a slightly more
// complicated version that allows a user session to be constructed.
var UserModelLogin = Backbone.Model.extend({
    username: '',
    password: '',

    url: function() {
	return '/login';
    }
});

// User deletion model: This is a model that cooresponds to a user
// object that is being deleted. It is then passed to the deletion
// end-point for destruction .
var UserModelDeletion = Backbone.Model.extend({
    username: '',
    password: '',

    url: function() {
	return '/delete';
    }
});
