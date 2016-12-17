angular.module('rehjeks.useroptions', [
  'ngCookies'
])

.controller('UserOptionsController', function($scope, Server, $cookies, $location) {
  $scope.user = {
    challenges: [],
    score: $cookies.get('userScore')
  };
  $scope.loggedin = true;
  // We store the points on the window and use that until we get the list of challenges
  $scope.points = window.GlobalUser.points || 0;
  $scope.logout = function() {
    $cookies.remove('username');
    $cookies.remove('userScore');
    $scope.loggedin = false;
  };
  
  $scope.redirect = function() {
    $location.path('/profile');
  };
  
  // Get challenges solved by user in order to enumerate points
  Server.getUserChallenges($scope, $cookies.get('username'))
  .then(results => {
    var pointValues = {'easy': 1, 'medium': 2, 'hard': 3};
    window.GlobalUser.points = $scope.user.challenges.map(challenge => {
      return pointValues[challenge.challenge.difficulty];
    })
    .reduce((a, b) => a + b);
    $scope.points = window.GlobalUser.points;
  });
});
 