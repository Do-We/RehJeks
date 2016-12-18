var mongoose = require('mongoose');
var Challenge = require('./challengeModel');
var User = require('../users/userModel');
var Solution = require('../solutions/solutionModel');

module.exports.getChallenges = function(req, res) {
  // Returns a list of challenges, if a username or a userId is provided it will be a tuple of the challenges that
  // the user has solved, and their respective solutions--otherwise, it will be an array of all challenges given the params.

  let {query: {quantity = 10, difficulty, order, username, userId}} = req;

  if (username || userId) { // If we are given a username, return a list of challenges that the user has solved and tack on the solutions as well
    let userSolutions;
    // Find userId based upon username
    User.findOne(username ? {username: username} : {id: userId})
    // Find all solutions for that user
    .then(user => Solution.find({userId: user.id}))
    // Store these solutions in userSolutions
    .then(solutions => userSolutions = solutions)
    // This line and the next one are building a Mongo query
    .then(solutions => solutions.map(solution => `{"id": "${solution.challengeId}"}`))
    // ...for the challenges that the user has solved
    .then(challengeIds => challengeIds.length ? `{"$or": [${challengeIds.join(', ')}]}` : '{"id": "0"}')
    // Query for all the challenges that the user has recorded solutions for
    .then(challengeQuery => Challenge.find(JSON.parse(challengeQuery))
    // Find [quantity] maximum problems (default is 10 if not specified)
    .limit(+quantity))
    // Make an array of challenge-solution tuple objects that will look like this:
    // {
    //   challenge: {challenge object},
    //   solution: {solution object}
    // }
    .then(challenges => challenges.map(chal => {
      var solution = userSolutions.filter(sol => sol.challengeId === chal.id)[0];
      return {challenge: chal, solution: solution};
    }))
    .then(solvedChallenges => res.send(solvedChallenges))
    .catch(err=>console.log(err));
  } else {
    // Query database for all challenges with a given difficulty (or all difficulties)
    Challenge.find(difficulty ? {difficulty: difficulty} : undefined)
    // Find [quantity] maximum problems
    // Note: quantity comes in from params as a string, Mongoose needs it as a number
    .limit(+quantity)
    .then(data => res.send(data));
  }
 

};

module.exports.getSingleChallenge = function(req, res) {
  // Serve up a single challenge in this order of priority:
    // If challengeId given in params, fetch that challenge
    // If difficulty given, select only challenges with the given difficulty:
      // If array of solved challenges given in params for a user who is not signed in (solvedChallenges),
        // Serve up a random challenge whose id is not contained in that array
      // If username or userId given in params
        // Serve up a random challenge not already solved by the user
  // If query takes more than ten tries to find a challenge the user hasn't
  // Already solved, then return a dummy challenge telling the user to try a harder difficulty

  let numTries = 0;

  let outOfChallenges = {
    title: 'You have solved all challenges at this difficulty!',
    prompt: 'Try moving up to something a little harder.',
    expected: ['really', 'go', 'try', 'something', 'harder']
  };

  let {query: {username, userId, difficulty, solvedChallenges, challengeId}} = req;


  // if specific challenge requested by Id, serve it
  if (challengeId) {
    return Challenge.findOne({id: challengeId})
    .then(challenge => res.send(challenge))
    .catch(err => res.statusCode(500).send(err));
  }


  var checkIfUserAlreadySolved = function(userId, challenge) {
    // Returns true if the user at userId has already solved the challenge
    // or if the challengeId is is challengeIdList.
    // Otherwise, returns the challenge


    if (solvedChallenges) {
      return new Promise(function(resolve, reject) {
        if (solvedChallenges.indexOf(challenge.id) !== -1) {
          if (numTries < 10) {
            numTries++;
            resolve(true);
          } else {
            resolve(outOfChallenges);
          }
        } else {
          resolve(challenge);
        }
      });
    }

    return Solution.findOne({userId: userId, challengeId: challenge.id})

    .then(function(solution) {
      if (solution) {
        if (numTries >= 10) {
          return outOfChallenges;
        } else {
          numTries++;
          return true;
        }
      } else {
        return challenge;
      }
    });

  };

  var findRandomChallenge = function(userId, count) {
    // Finds a random challenge that the user at userId hasn't already solved

    let rand = parseInt(Math.random() * count);

    return Challenge.findOne(difficulty ? {difficulty: difficulty} : undefined)

    .skip(rand)

    .then(function(challenge) {
      return checkIfUserAlreadySolved(userId, challenge);
    })

    .then(function(challengeOrSolved) {
      if (challengeOrSolved === true) {
        return findRandomChallenge(userId, count);
      } else {
        return challengeOrSolved;
      }
    })

    .catch((err)=>console.log('Database Error on finding challenge:', err));
  };


  // find userId given username
  return new Promise(function(resolve, reject) {
    if (userId === undefined && username !== undefined) {
      return User.findOne({username: username})

      .then((user) => {
        if (user) { userId = user.id; }
        resolve();
      })

      .catch((err) => reject(err));

    } else {
      resolve();
    }
  })
  // Count challenges to select our random seed
  .then(function() {
    return Challenge.count(difficulty ? {difficulty: difficulty} : undefined);
  })
  // Find the challenge given the count of challenges
  .then(function(count) {
    return findRandomChallenge(userId, count);
  })
  // Serve the challenge
  .then(challenge => res.send(challenge))

  .catch((err) => res.statusCode(500).send('Unknown Error serving challenge'));

};

module.exports.submitNewChallenge = function(req, res) {
  // Saves a challenge. Can work off of username or userId for the author.
  // If no username or userId given, records "anonymous".

  let {body: {username, userId}, body: challenge} = req;

  let newChallenge = new Challenge(challenge);

  // Find the userID of the user at username, then store the challenge with that userID
  User.findOne(username ? {username: username} : userId ? {id: userId} : undefined)

  .then((user) => {
    if (user) {
      delete newChallenge.username;
      newChallenge.userId = user.id;
    } else {
      newChallenge.userId = 'anonymous';
    }
    return newChallenge.save();
  })

  .then(function(data) {
    res.send(200);
  })
  
  .catch(function(err) {
    console.log('error while submitting a new challenge:', err);
    res.send(err);
  });

};

// Get random question 
module.exports.fetchRandomChallenge = function(req, res) {
  Challenge.find({}, function(err, challenge) {
    if (err) {
        res.status(500).send(err);
      }
    var index = Math.floor(Math.random() * challenge.length - 1);
    res.send(challenge[index]);
  }
  );
};
  //different from current grab random question, this has no restrictions
  
  // query the database for challenge collection and get total count

  // after the total amount of questions is known,

    // query the database for a challenge by use of 
    // Math.ceil(math.random * count of collection);
      // resend back the challenge it found