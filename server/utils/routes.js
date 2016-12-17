
var userController = require('./users/userController.js');
var challengeController = require('./challenges/challengeController.js');
var solutionController = require('./solutions/solutionController.js');
var passport = require('passport');

module.exports = function (app, express) {
  ////////////////
  // GET REQUESTS
  ////////////////
  app.get('/challenge', challengeController.getSingleChallenge);

  app.get('/challenges', challengeController.getChallenges);

  app.get('/vschallenge', challengeController.fetchRandomQuestion)

  app.get('/solution', solutionController.getOtherSolutions);

  app.get('/logout', userController.logout);

  app.get('/leaderboard', userController.getUsers);
  
  ////////////////
  // POST REQUESTS
  ////////////////

  app.post('/signup', userController.signup);

  app.post('/login', passport.authenticate('local'), function(req, res) {
    res.json({message: 'Success', username: req.user.username, userid: req.user.id});
  }); 

  // We store the solution when someone solves a challenge
  app.post('/solution', solutionController.addUserSolution);

  app.post('/challenge', challengeController.submitNewChallenge);

};
 