angular.module('rehjeks.profile', [
  'ngCookies'
])

.controller('UserprofileController', function($scope, Server, $cookies, $location, $moment) {

  $scope.user = {};
  $scope.user.difficulties = {};
  $scope.user.challenges = [];
  $scope.user.difficulties.easy = 0;
  $scope.user.difficulties.medium = 0;
  $scope.user.difficulties.hard = 0;
  $scope.username = $cookies.get('username');
  $scope.user.show = false;
  $scope.user.points = 0;

  $scope.formatTime = function(timeStr) {
    return $moment(timeStr).fromNow();
  };

  // Send us away if we log out while on the page
  $scope.$watch(function() {return $cookies.get('username'); }, function(newValue) {
    if (!newValue) {
      $location.path('/solve');
    }
  });


  $scope.getUserChallenges = function() {
  	return Server.getUserChallenges($scope, $cookies.get('username'));
  };

  $scope.show = function() {
    return $scope.user.show === !$scope.user.show;
  };

  $scope.showTime = function(timeStr) {
    return new Date(Number(timeStr)).toUTCString().slice(20,25);
  }

  $scope.getUserChallenges()
  .then(function(challenges) {
    $scope.user.challenges.forEach(function(challenge){
      if(challenge.challenge.difficulty === 'easy'){
        $scope.user.difficulties.easy++;
      }
      else if(challenge.challenge.difficulty === 'medium'){
        $scope.user.difficulties.medium++;
      }
      else if(challenge.challenge.difficulty === 'hard'){
        $scope.user.difficulties.hard++;
      }
    })
    $scope.user.points = (
      $scope.user.difficulties.hard * 3
      + $scope.user.difficulties.medium * 2
      + $scope.user.difficulties.easy * 1
    );

  });

});
