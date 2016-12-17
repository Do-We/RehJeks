
angular.module('rehjeks.challenges', [])

.controller('ChallengesController', function($scope, $interval, $cookies, Server, PUBNUB, Pubnub) {
  $interval.cancel(window.solutionClock);
  $scope.difficulty;
  $scope.quantity;
  $scope.challengeList = [];
  $scope.incrementTimer = function() {
    $scope.waitTimer++;
  };
  //timer counter for time spent in queue
  $scope.waitTimer = 0;

  $scope.getChallenge = function(challenge) {
    Server.getChallenge(challenge);
  };

//join new 1v1 battle
  $scope.joinOneVsOne = function() {
    if ($cookies.getAll().username) {
      PUBNUB.initPubnub();
      PUBNUB.subscribe(['queue']);
      $interval($scope.incrementTimer, 1000);
      // $scope.waitTimerStart();
      //add redirect logic here to go to head to head page
    }
  };

//leaves queue or leaves battle
  $scope.leaveQueue = function() {
    Pubnub.unsubscribeAll();
    //redirect to different page
  };        

  $scope.getAllChallenges = function() {
    Server.getAllChallenges($scope, $scope.difficulty, $scope.quantity);
  };

  $scope.getAllChallenges();

});
