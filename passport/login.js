var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');
var util = require('util');
var server_config = require('../server_config.js');

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GOOGLE_CLIENT_ID = '636967012649-n4d5fs72d43ksmupf4t653kgre6p9llu.apps.googleusercontent.com';
var GOOGLE_CLIENT_SECRET = '8yYLJGj102DihEyp6oFxkWQa';

module.exports = function(passport){

  passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
            // check in mongo if a user with username exists or not
            User.findOne({ 'username' :  username }, 
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err)
                        return done(err);
                    // Username does not exist, log the error and redirect back
                    if (!user){
                        console.log('User Not Found with username '+username);
                        return done(null, false, req.flash('message', 'User Not found.'));                 
                    }
                    // User exists but wrong password, log the error 
                    if (!isValidPassword(user, password)){
                        console.log('Invalid Password');
                        return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
                    }
                    // User and password both match, return user from done method
                    // which will be treated like success
                    return done(null, user);
                }
            );

        })
    );

    passport.use('google', new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://'+server_config.serverip+':'+server_config.serverport+'/auth/google/callback'
      },
      function(accessToken, refreshToken, profile, done) {
        console.log(profile);

        User.findOne({ 'email' : profile._json['email']}, function(err, user) {
          if (err){
              console.log('Error in SignUp: '+err);
              return done(err);
          }
          // already exists
          if (user) {
            user.username = profile._json['name'];
            user.firstName = profile._json['given_name'];
            user.lastName = profile._json['family_name'];
            user.picture = profile._json['picture'];
          
            user.save(function(err) {
              if (err){
                console.log('Error in Saving user: '+err);  
                throw err;  
              }
              console.log('User succesfully updated');    
            });
          } else {
            var newUser = new User();
            newUser.username = profile._json['name'];
            newUser.firstName = profile._json['given_name'];
            newUser.lastName = profile._json['family_name'];
            newUser.picture = profile._json['picture'];
            
            newUser.save(function(err) {
              if (err){
                console.log('Error in Saving user: '+err);  
                throw err;  
              }
              console.log('User Registration succesful');    
            });
          }
        });



        process.nextTick(function () {
          return done(null, profile);
        });
      }
    ));

    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    }
    
}