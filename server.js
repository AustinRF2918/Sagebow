module.exports = function(EXPRESS_PORT, EXPRESS_ROOT){
    // Used modules
    var app = require('express')();
    var bodyParser = require('body-parser');
    var session = require('express-session');

    // var fs = require('fs');
    var redisConn = require('redis').createClient();
    var bcrypt = require('bcryptjs');
    
    // Application Configuration
    var appPort = EXPRESS_PORT;
    
    // Express modules
    app.use(require('connect-livereload')());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(session({
        secret: require('hat')(),
        resave: false,
        saveUninitialized: false
    }));

    //Helper functions described in server/helper.js.
    var serveFile = require('./server/helpers.js')( EXPRESS_PORT, EXPRESS_ROOT ).serveFile;
    var attemptSave = require('./server/helpers.js')( EXPRESS_PORT, EXPRESS_ROOT ).attemptSave;
    var responseGenerator = require('./server/ajResponse.js');
    
    // PUBLIC ROUTES:
    // Public
    app.get(/^\/res\/.+/, function(req, res) {
        serveFile(req.url.match('[^?#]+')[0],res);
    });

    app.get('/login',function(req,res){
        serveFile('/login.html',res);
    });

    app.get('/setup',function(req,res){
        serveFile('/setup.html',res);
    });
    
    // Post Login
    app.post(/^\/login$/,function(req,res){
        var username = req.body.username.trim();
        var password = req.body.password.trim();
        
	//Not neccessary anymore: handled on the front end.
        //if(!username || !password){
        //    res.redirect('/login.html#incomplete');
        //} else {
            // Attempt user lookup
            redisConn.get(username,function( err, userObj ){
                userObj = JSON.parse(userObj);
                if( err ){
		    //Internal server error.
		    var responseData = responseGenerator.loginErrorResponse( err );
		    responseGenerator.sendResponseObject( res, responseData );

                } else if ( !userObj ) {
		    // User not found.
		    var responseData = responseGenerator.userNotFoundResponse( );
		    responseGenerator.sendResponseObject( res, responseData );

                } else if( !bcrypt.compareSync(password, userObj.passwordHash )){
		    // Bad password.
		    var responseData = responseGenerator.invalidPasswordResponse( );
		    responseGenerator.sendResponseObject( res, responseData );

                } else {
		    // Grant access!
		    console.log('granting access');
		    req.session.userObj = userObj;
		    res.redirect('/metrics');
		}
	    }
	);
    });
    
    // Post setup
    app.post(/^\/setup$/,function(req,res){
        // Check fields are present
        var neededFields = [
            'username',
            'password',
            'weight',
            'bmi',
            'dailyCalories'];
        var fieldsPresent = true;
        for(var field of neededFields){
            if(!req.body[field]){
                fieldsPresent = false;
                break;
            }
        }
        if(fieldsPresent){
            // verify integrity
            // if(req.body.username.match(/.{6,}/) && req.body.password.match())
            
            // Hash password
            var passwordHash = bcrypt.hashSync(req.body.password);
            // Construct user object
            var userObj = {
                username:req.body.username,
                passwordHash:passwordHash,
                weightHistory:[],
                weight:req.body.weight,
                lastUpdated: new Date(),
                bmi:req.body.bmi,
                dietPlan:{
                    weightGoal:req.body.weightGoal,
                    dailyCalories:req.body.dailyCalories
                },
                nutrientHistory:[]
            };
            // Save and redirect to login
            new Promise(function(resolve,reject){
                // Verify user doesn't exist
                redisConn.get(userObj.username,function(err,reply){
                    if(err){
                        res.status(200).send('error');
                        reject(err);
                    }else{
                        if(reply){
                            console.log('username exists. Cant setup');
                            res.status(200).send('exists');
                        }else{
                            resolve();
                        }
                    }
                });
            }).then(function(){
                return new Promise(function(resolve,reject){
                    // attempt to save
                    redisConn.set(userObj.username,JSON.stringify(userObj),function(err){
                        if(err){
                            // save failed
                            res.status(200).send('error');
                            reject(err);
                        }else{
                            // save successful!
                            res.status(200).send('success');
                            resolve();
                        }
                    });
                });
            }).catch(function(err){
                console.error(err);
            });
        }else{
            // Missing fields
            res.status(200).send('incomplete');
        }
    });
    
    // PRIVATE ROUTES
    app.get('*',function(req,res,next){
        if(req.session.userObj){
            // Free to proceed
            next();
        }else{
            // Login first!
            res.redirect('/login#noAccess');
        }
    });
    app.get('/metrics',function(req,res){
        serveFile('metrics.html',res);
    });
    app.get('/entry',function(req,res){
        serveFile('entry.html',res);
    });
    
    // PRIVATE API
    // Add weight event
    app.post('/api/weight',function(req,res){
        var weight = req.body.value;
        if(!weight){
            res.status(400).send('Value param expected');
        }else{
            var timestamp = req.body.timestamp || new Date();
            // Convert to date
            timestamp = new Date(timestamp);
            
            // Used in case of failure. Deep copy
            var oldUserObj = JSON.parse(JSON.stringify(req.session.userObj));
            
            // Add entry
            req.session.userObj.weightHistory.push({
                weight:weight,
                timestamp:timestamp
            });
            
            // Update modify date if needed
            if(new Date(req.session.userObj.lastUpdated) < timestamp){
                req.session.userObj.lastUpdated = timestamp;
            }
            
            // Attempt to save...
            attemptSave(req,res,oldUserObj);
        }
    });
    // Get weight events
    app.get('/api/weight',function(req,res){
        var minTime = req.query.min,
            maxTime = req.query.max;
        
        // Format as dates
        if(minTime){
            minTime = new Date(minTime);
        }
        if(maxTime){
            maxTime = new Date(maxTime);
        }
        
        var results = req.session.userObj.weightHistory.filter(function(weightEvent){
            if(!minTime || minTime <= new Date(weightEvent.timestamp)){
                // no min time or within range
                if(!maxTime || maxTime >= new Date(weightEvent.timestamp)){
                    // no max time or within range
                    return true;
                }
            }
            return false;
        });
        
        res.status(200).send(results);
    });
    
    // Add consumption event
    app.post('/api/consumption',function(req,res){
        var carb = req.body.carb,
            fat = req.body.fat,
            protein = req.body.protein,
            name = req.body.name,
            timestamp = req.body.timestamp || new Date();
        
        // Validate fields
        if(!carb || !fat || !protein){
            res.status(400).send('Missing required calorie params');
        }else{
            // Formatting
            timestamp = new Date(timestamp);
            carb = parseFloat(carb);
            fat = parseFloat(fat);
            protein = parseFloat(protein);
            
            // Used in case of failure. Deep copy
            var oldUserObj = JSON.parse(JSON.stringify(req.session.userObj));
            
            // Add entry
            req.session.userObj.nutrientHistory.push({
                calories: carb+fat+protein,
                carb: carb,
                fat: fat,
                protein: protein,
                name:name,
                timestamp:timestamp
            });
            
            attemptSave(req,res,oldUserObj);
        }
    });
    app.get('/api/consumption',function(req,res){
        var minTime = req.query.min,
            maxTime = req.query.max;
            
        // Format as dates
        if(minTime){
            minTime = new Date(minTime);
        }
        if(maxTime){
            maxTime = new Date(maxTime);
        }
        
        var results = req.session.userObj.nutrientHistory.filter(function(consumptionEvent){
            if(!minTime || minTime <= new Date(consumptionEvent.timestamp)){
                // no min time or within range
                if(!maxTime || maxTime >= new Date(consumptionEvent.timestamp)){
                    // no max time or within range
                    return true;
                }
            }
            return false;
        });
        
        res.status(200).send(results);
    });
    
    // Get food name history
    app.get('/api/foods',function(req,res){
        var results = [];
        for(var foodEvent of req.session.userObj.nutrientHistory){
            if(foodEvent.name){
                results.push(foodEvent.name);
            }
        }
        res.status(200).send(results);
    });
    app.get('/api/foods/*',function(req,res){
        var foodName = req.path.split('/')[3];
        if(!foodName){
            res.status(400).send('need a food name');
        }else{
            for(var foodEvent of req.session.userObj.nutrientHistory){
                if(foodEvent.name === foodName){
                    res.status(200).send(foodEvent);
                    break;
                }
            }
        }
    });
    
    app.listen(appPort);
};
