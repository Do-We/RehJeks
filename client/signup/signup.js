angular.module('rehjeks.signup', [])
  .controller('SignupController', function ($scope, Auth) {
    $scope.user = {};
    $scope.loggedin = false;

    $scope.signup = function() {
      Auth.authorize($scope.user, '/signup', $scope);
    };

  });
 