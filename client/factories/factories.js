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

  var authorize = function( {username, password}, route, $scope) {
    return $http({
      method: 'POST',
      url: serverURL + route,
      data: JSON.stringify({username: username, password: password})
    })
    .then(
      function(successRes) { //first param = successCallback
        document.cookie = `username=${successRes.data.username}; userId=${successRes.data.userid};`;
        $scope.loggedin = true;
        return true;
      },
      function(errorRes) { //second param = errorCallback
        return errorRes;
      }
    );
  };

  var logout = function() {

    $http({
      method: 'GET',
      url: serverUrl + '/logout'
    })
    .then(result => console.log('logged out response from back-end'));

  };

  return {
    authorize: authorize,
    logout: logout
  };


})

.factory('Server', function($http, $location, $cookies, $sanitize) {

  var serverURL = $location.protocol() + '://' + location.host;
  //shared acces for Challenges and Solve Controller
  var currentChallenge = {data: undefined};

  var getRandom = function($scope) {

    var difficulty = $scope.difficulty;
    var username = $cookies.get('username');
    var solvedChallenges = window.GlobalUser.solvedChallenges;
    // var solvedChallenges = window.GlobalUser.solvedChallenges;

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


  var getUserChallenges = function($scope, username) {
    // Getting user specific challenges to display on profile
    return $http({
      method: 'GET',
      url: serverURL + '/challenges',
      params: {username: username},
      paramSerializer: '$httpParamSerializerJQLike'
    })
    .then(function(challenges) {
      $scope.user.challenges = challenges.data;
    });
  };

  var getChallenge = function(challenge) {

        //SET currentChallengeData to returned Data
    currentChallenge.data = challenge;
    $location.path('solve');

  };


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

  var submitNewChallenge = function($scope) {
    // Creating new challenge by user

    let {submitData:{title, prompt, text, difficulty, expected, answer, cheats}} = $scope;

    text = $sanitize(text);

    let submitData = {
      username: $cookies.get('username'),
      title: title,
      prompt: prompt,
      text: text,
      difficulty: difficulty,
      expected: expected(),
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

    let {challengeData: {id}} = $scope;

    return $http({
      method: 'GET',
      url: serverURL + '/solution',
      params: {challengeId: id, quantity: 5}
    });

  }
  ///////////////////////////
  //    Factory Interface  //
  ///////////////////////////

  return {
    getAllChallenges: getAllChallenges,
    getUserChallenges: getUserChallenges,
    getRandom: getRandom,
    getChallenge: getChallenge,
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
