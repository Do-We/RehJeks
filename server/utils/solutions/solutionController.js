var mongoose = require('mongoose');
var Solution = require('./solutionModel');
var User = require('../users/userModel');

module.exports.getOtherSolutions = function(req, res) {
  // Will return a list of solutions, quantity limit given by "quantity"
  // Either provide a challengeId and it will return solutions for the challenge
  // Or provide a username/userId and a list of the user's solutions will be sent.

  let {query: {username, userId, challengeId, quantity = 10}} = req;

  if (challengeId) {
    // Find all solutions for a given challenge
    Solution.find({challengeId: challengeId})
    // Maximum [quantity] results, default value is 10
    .limit(+quantity)
    .then(data => res.send(data))
    .catch(err => { res.sendStatus(500); console.log(err); });

  } else {
    // Find user by username
    User.findOne(userId ? {id: userId} : {username: username})
    // Find all solutions for said user
    .then(user => Solution.find({userId: user ? user.id : 'undefined'}).limit(+quantity))
    .then(data => res.send(data))
    .catch(err => { res.sendStatus(500); console.log(err); });

  }
};
 
module.exports.addUserSolution = function(req, res) {
  // Adds a (correct) solution to the database. If user not logged in, records "anonymous" as their userId.

  let {body: {userId, username, challengeId, solution, timeToSolve}} = req;

  User.findOne(userId ? {id: userId} : {username: username})
  .then(user => Solution.create({
    userId: user ? user.id : 'anonymous',
    challengeId: challengeId,
    solution: solution,
    timeToSolve: timeToSolve 
  }))
  .then(result => res.send(200))
  .catch(err => { res.sendStatus(500); console.log(err); });

};
