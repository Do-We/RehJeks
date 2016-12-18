
angular.module('rehjeks.challenges', [])

.controller('ChallengesController', function($scope, $interval, $cookies, Server) {
  $interval.cancel(window.solutionClock);
  $scope.difficulty;
  $scope.quantity;
  $scope.challengeList = [];
  

  $scope.getChallenge = function(challenge) {
    Server.getChallenge(challenge);
  };

  $scope.getAllChallenges = function() {
    Server.getAllChallenges($scope, $scope.difficulty, $scope.quantity);
  };

  $scope.getAllChallenges();

});
