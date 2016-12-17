var mongoose = require('mongoose');
var User = require('./userModel');
var Solution = require('../solutions/solutionModel');
var passport = require('passport');

// Note: this code is deprecated
// module.exports.getSolvedChallenges = function(req, res, next) {
//   // Send username via request from front end to get userID
//   var user = req.query.username;
//
//   User.findOne({username: user})
//   .then(function(user) {
//     return Solution.find({userId: user.id});
//   })
//   .then(function(solutions) {
//     if (solutions) {
//       console.log('got solutions');
//       res.json(solutions);
//     } else {
//       next(new Error('user does not have any solutions to display'));
//     }
//   });
// };


module.exports.signup = function(req, res, next) {
  var { body: {username, password} } = req;

  User.register(new User({ username : username }), password, function(err, account) {
    if (err) {
      next(new Error('error registering user'));
    }
    else{
      passport.authenticate('local')(req, res, function () {
      console.log('authenticated!');
      res.json({message: 'Success', username: req.user.username, userid: req.user.id, score: req.user.score});
    });
    }
  });
};

module.exports.logout = function(req, res, next) {
  req.session.destroy(result => console.log('session destroyed'));
};

module.exports.getUsers = function(req, res) {
  User.find(function(err, user){
    if(err) { res.status(500).send(err)}
    res.send(user);
  })
};

