const EXPRESS_PORT = require('../configuration.js').EXPRESS_PORT;
const EXPRESS_ROOT = require('../configuration.js').EXPRESS_ROOT;
const DEBUG = require('../configuration.js').DEBUG;

const serveFile = require('../helpers.js')(EXPRESS_PORT, EXPRESS_ROOT).serveFile;
const express = require('express');

const router = express.Router();

// TODO: SEPERATE OUT!!
const redisConn = require('redis').createClient();
const bcrypt = require('bcryptjs');

// Query  Endpoint [GET]
//
// This is a proxy for the national
// food database: we place in a specific
// food name and see if it exists in
// the governments API.
router.get('/api/query/:name',function(req, res){
    console.log("Recieved a GET on /api/query/:name.");

    // Utilizing a promise monad, we sequentially access the
    // api for the usda and get nutritional information back to the client.
    new Promise( (resolve, reject) => {
	const url = `http://api.nal.usda.gov/ndb/search/?format=json&q=${req.params.name}&max=1&api_key=${API_KEY}`;

	request(url, (err, response, body) => {
	    if (err || response.statusCode !== 200) {
		res.status(400).end('Unable to perform request');
	    } else {
		resolve(JSON.parse(body).list.item[0].ndbno);
	    }
	});
    }).then( (databaseNumber) => {
	const url = `http://api.nal.usda.gov/ndb/reports/?ndbno=${databaseNumber}&type=s&format=json&api_key=${API_KEY}`;

	request(url, function(err, response, body) {
	    if (err || response.statusCode !== 200) {
		res.status(400).end('Unable to perform request');
	    } else {
		let foodData = {};
		const nutrients = JSON.parse(body).report.food.nutrients;

		// Find the nutrients we are interested in
		// Make this a method.
		for (let nutrient of nutrients){
		    if (nutrient.nutrient_id == 203){
			foodData.proteins = nutrient.value;
		    } else if (nutrient.nutrient_id == 204){
			foodData.fats = nutrient.value;
		    } else if(nutrient.nutrient_id == 205){
			foodData.carbs = nutrient.value;
		    }
		}

		res.send(foodData);
	    }
	});
    });
});

module.exports = router;
