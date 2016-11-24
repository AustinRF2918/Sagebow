var DEBUG = true;
console.log(`Setting DEBUG to ${DEBUG} in models/user.js.`);

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

    initialize: function() {
	if (DEBUG) {
	    console.log("[models/user.js::UserSetupModel::initialize]: Initializing object...");
	    console.log(`Fields:
			 username: ${this.username},
			 password: ${this.password},
			 weight: ${this.weight},
			 height: ${this.height},
			 age: ${this.age},
			 bmi: ${this.bmi},
			 bmr: ${this.bmr},
			 activitySelector: ${this.activitySelector},
			 goalSelector: ${this.goalSelector},
			 genderSelector: ${this.genderSelector},
			 dailyCalories: ${this.dailyCalories} `);
	}
    },

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

    initialize: function() {
	if (DEBUG) {
	    console.log("[models/user.js::UserSetupModel::initialize]: Initializing object...");
	    console.log(`Fields:
			 username: ${this.username},
			 password: ${this.password}`)
	}
    },

    url: function() {
	return '/login';
    }
});
