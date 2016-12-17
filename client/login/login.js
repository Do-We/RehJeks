angular.module('rehjeks.login', [])
  .controller('LoginController', function($scope, Auth) {
    $scope.user = {};
    $scope.showLogin = true;
    $scope.showSignup = false;
    $scope.signin = false;
    $scope.actionTitle = 'Login';
    $scope.loggedin = document.cookie !== 'undefined' && document.cookie !== '';
    $scope.loginFailed = false;


    $scope.login = function () {
      Auth.authorize($scope.user, '/login', $scope);
    };

    $scope.submit = function() {
      if ($scope.showLogin) {
        Auth.authorize($scope.user, '/login', $scope)
        .then((resp) => resp.data === 'Unauthorized' ? $scope.loginFailed = true : undefined);
      } else if ($scope.showSignup ) {

        Auth.authorize($scope.user, '/signup', $scope)
        .then((resp) => resp.data.slice(0, 5) === 'Error' ? $scope.loginFailed = true : undefined);
      }
      var form = document.getElementsByName('loginForm')[0];
      form.reset();
    };

    $scope.seeLogin = function() {
      $scope.showLogin = true;
      $scope.showSignup = false;
      $scope.loginFailed = false;
      $scope.actionTitle = 'Login';
    };

    $scope.seeSignup = function() {
      $scope.showLogin = false;
      $scope.showSignup = true;
      $scope.loginFailed = false;
      $scope.actionTitle = 'Signup';
    };

    $scope.logout = function() {
      document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
      window.GlobalUser.username = '';
      $scope.loggedin = false;
    };


  });
