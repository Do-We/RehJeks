angular.module('rehjeks.landingPage', [
  'rehjeks.login',
  'rehjeks.signup',
  'rehjeks.profile',
  'ngCookies',
  'ui.router'
])
  .controller('landingPageController', function($scope, $cookies) {
    $scope.loggedIn = $cookies.get('username');
    $scope.username = $cookies.get('username');

    $scope.$watch(function() { return $cookies.get('username'); }, function(newValue) {
      var username = $cookies.get('username');
      $scope.loggedIn = !!username;
      $scope.username = $cookies.get('username');
    });
  })