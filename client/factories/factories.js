//////////////////////////////////
//                              //
//        DUMMY DATA            //
//                              //
//////////////////////////////////


window.GlobalUser = {};
window.GlobalUser.solvedChallenges = [];

//////////////////////////////////
//                              //
//            APP               //
//                              //
//////////////////////////////////

angular.module('rehjeks.factories', [
  'ngCookies',
  'ngSanitize'
])

.factory('Auth', function($http, $location, $window) {

  var serverURL = $location.protocol() + '://' + location.host;

  //Authorize method used to authenticate user when logging in or signing up
  //Cookie is stored in document.cookie with username and userId info

  var authorize = function( {username, password}, route, $scope) {
    return $http({
      method: 'POST',
      url: serverURL + route,
      data: JSON.stringify({username: username, password: password})
    })
    .then(
      function(successRes) { //first param = successCallback

        // Set cookies if login successful!
        document.cookie = `username=${successRes.data.username}; userId=${successRes.data.userid};`;
        document.cookie = `userScore =${successRes.data.score};`;
        // This will change the "Login" anchor tag in the navbar to your username
        $scope.loggedin = true;
        return true;
      },
      function(errorRes) { //second param = errorCallback
        return errorRes;
      }
    );
  };

  /*Logout method used to logout user by sending a GET request to the server
    where the session is destroyed */

  var logout = function() {

    $http({
      method: 'GET',
      url: serverUrl + '/logout'
    })
    .then(result => console.log('logged out response from back-end'));

  };

  return {
    authorize: authorize,
    logout: logout,
  };
})

//join queue
  //gets sent message of channel to join
    //subscribe to author of messages channel
    //leave queue
  //if no message sent, then listening for new presence
  //on new presence, 
    //send message containing your username and their username
    //subscribe to new partners channel
    //leave queue


//require auth/being signed in
//figure out how to access currently logged in user
.factory('PUBNUB', function($http, $location, $cookies, $sanitize, Pubnub, Server) {
  //subscribe to a channel
  var subscribe = function(channelNameArray) {
    //subscribe with given channel, with presence true
    Pubnub.subscribe({
      channels: channelNameArray, 
      withPresence: true,
      triggerEvents: true
    });
    console.log('subscribed to channels ', channelNameArray);
  };

  //publish to channel
  var publish = function(message, channel) {
    //publish to given channel, with given message
    Pubnub.publish({
      message: message, 
      channel: channel
    });
  };

  //unsubscribe to channel
  var unsubscribe = function(unsubArray) {
    //unsubscribe to given channel 
    Pubnub.unsubscribe({channels: unsubArray});
  };

  //store current partner in competition
  var partner = {};
  var challenge = {};
  var gameOver = {};
  var input = {};

  //define function to invite a  user to chat
  var inviteUserInQueue = function(otherUser, challenge) { 

    publish([otherUser, $cookies.get('username'), challenge], 'queue');
  };
  
  //initialize with uid of the currently logged in user
  //includes .once function, so will need to be re-intialized for every new queueing
  var initPubnub = function() {
    Pubnub.init({
      subscribeKey: 'sub-c-c95e1814-c251-11e6-b38f-02ee2ddab7fe',
      publishKey: 'pub-c-6d77ac1d-8da3-4140-9a9a-c0da9b0c0bf9',
            //dont know if this works, may need to require in a factory that has access to current user
      uuid: $cookies.get('username'), 
      ssl: true,
    });
    console.log('started Pubnub as ', Pubnub.getUUID());
    //add listeners
    Pubnub.addListener({
    //on new presence
      presence: function(p) {
      //if someone joins the queue channel
        if (p.action === 'join' && p.channel === 'queue' && p.uuid !== $cookies.get('username')) {
        //if no partner
          if (!partner) { 
            Server.fetchRandomQuestion()
              .then( (result) => { 
                //send message to queue channel with our username and new presences username
                challenge.value = result.data;
                inviteUserInQueue(p.uuid, challenge); 
              })
              .catch();
          //subscribe to new users channel
            subscribe([p.uuid]);
          //unsub from queue
            unsubscribe(['queue']);
          }  
        }
      },
    //on message 
      message: function(m) {
      //if message from queue 
        if (m.channel === 'queue') {
        //if contains username, 
          if (m.message[0] === $cookies.get('username')) {
          //subscribe to other persons channel
            challenge = m.message[2];
            subscribe([m.message[1]]);
          //unsub from queue  
            unsubscribe(['queue']);
          }
        }
        if (m.message.end) {
          gameOver.value = m.message.end;
        }
        if (m.message.input) {
          input.value = m.message.input;
        }
      }
    });      
  };

  return {
    initPubnub: initPubnub,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    publish: publish,
    challenge: challenge,
    gameOver: gameOver,
    input: input
  };


})

.factory('Server', function($http, $location, $cookies, $sanitize) {

  var serverURL = $location.protocol() + '://' + location.host; 
  //shared acces for Challenges and Solve Controller
  var currentChallenge = {data: undefined};

  //Gets a random challenge by sending a request to the server
  //Queries on username stored in cookies in order to get a challenge 
  //not already solved by user

  var getRandom = function($scope) {

    var difficulty = $scope.difficulty;
    var username = $cookies.get('username');

    // solvedChallenges is an array of the challenge IDs that we keep track of
    // if the user isn't logged in, so we don't keep serving them challenges
    // they have already solved
    var solvedChallenges = window.GlobalUser.solvedChallenges;

    // Only send solvedChallenges if user is not signed in. Otherwise just send username
    // And the server will find which challenges they have already solved from the database
    var params = username ? {username, difficulty} : {difficulty, solvedChallenges};

    return $http({
      method: 'GET',
      url: serverURL + '/challenge',
      params: params,
      paramSerializer: '$httpParamSerializerJQLike'
    })
    .then(
      function(returnedChallenge) { //first param = successCallback

        //pass challenge to proper scope to display
        $scope.challengeData = returnedChallenge.data;

        //save current challenge in shared access
        currentChallenge.data = returnedChallenge.data;

        return returnedChallenge.data.text;

      })
    .catch(
      function(errorRes) { //second param = errorCallback
        console.log(errorRes);
      });

  };

  var getUsers = function($scope) {
    return $http({
      method: 'GET',
      url: serverURL + '/leaderboard',
    })
    .then(function(allUsers) {
      $scope.leaders = allUsers.data;
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  //Gets all challenges

  var getAllChallenges = function($scope, difficulty, quantity) {

    $http({
      method: 'GET',
      url: serverURL + '/challenges',
      params: {difficulty, quantity}
    })
    .then(
      function(returnedData) { //first param = successCallback
        $scope.challengeList = returnedData.data;
      })
    .catch(
      function(errorRes) { //second param = errorCallback
        console.log(errorRes);
      });

  };

  //Gets all User challenges by sending a GET request to server and querying by username

  var getUserChallenges = function($scope) {
    // Getting user specific challenges to display on profile
    return $http({
      method: 'GET',
      url: serverURL + '/challenges',
      params: {username: $cookies.get('username')},
      paramSerializer: '$httpParamSerializerJQLike'
    })
    .then(function(challenges) {
      $scope.user.challenges = challenges.data;
    });
  };

  var fetchRandomQuestion = function($scope) {
    return $http({
      method: 'GET',
      url: serverURL + '/vschallenge',
      paramSerializer: '$httpParamSerializerJQLike'
    });
  }; 

  //SETs currentChallengeData to returned Data

  var getChallenge = function(challenge) {
    // SET currentChallengeData to returned Data upon clicking a challenge in Challenges view

    currentChallenge.data = challenge;
    $location.path('solve');

  };


  //Sends a POST request to server in order to verify if user submitted solution is valid  

  var submitUserSolution = function(solution, challengeId, timeToSolve) {

    var submission = {
      solution: solution,
      username: $cookies.get('username'),
      challengeId: challengeId,
      timeToSolve: timeToSolve
    };

    return $http({
      method: 'POST',
      url: 'solution',
      data: JSON.stringify(submission)
    });

  };

  // Creating new challenge by user

  var submitNewChallenge = function($scope) {

    let {submitData: {title, prompt, text, difficulty, expected, answer, cheats}} = $scope;

    text = $sanitize(text);

    let submitData = {
      username: $cookies.get('username'),
      title: title,
      prompt: prompt,
      text: text,
      difficulty: difficulty,
      expected: expected(), // generated by a function, not entered in the submit form, so we must invoke it
      answer: answer,
      cheats: cheats
    };

    return $http({
      method: 'POST',
      url: serverURL + '/challenge',
      data: JSON.stringify(submitData)
    });

  };

  var getOtherSolutions = function($scope) {
    // Get other solutions for a given challenge to be displayed upon solving the challenge.
    let {challengeData: {id}} = $scope;

    return $http({
      method: 'GET',
      url: serverURL + '/solution',
      params: {challengeId: id, quantity: 5}
    });

  };
  ///////////////////////////
  //    Factory Interface  //
  ///////////////////////////

  return {
    getAllChallenges: getAllChallenges,
    getUserChallenges: getUserChallenges,
    getRandom: getRandom,
    getChallenge: getChallenge,
    fetchRandomQuestion: fetchRandomQuestion,
    getUsers: getUsers,
    currentChallenge: currentChallenge,
    submitUserSolution: submitUserSolution,
    submitNewChallenge: submitNewChallenge,
    getOtherSolutions: getOtherSolutions
  };

})
.factory('RegexParser', function() {

  var regexBody = /[^\/].*(?=\/[gim]{0,3}$)/;
  var regexFlags = /[gim]{0,3}$/;

  var makeRegex = function(regexStr) {
    var attemptBody = regexStr.match(regexBody);
    var attemptFlags = regexStr.match(regexFlags);

    // Create new regex object
    return new RegExp(attemptBody, attemptFlags);
  };

  return makeRegex;
});
