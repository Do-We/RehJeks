angular.module('rehjeks.nav', [
  'rehjeks.login',
  'rehjeks.signup',
  'ngCookies',
  'ngAnimate',
  'ui.router'
])

.controller('NavController', function($scope, $cookies) {
  $scope.loggedIn = $cookies.get('username');
  $scope.showDropdown = false;
  $scope.username = $cookies.get('username');

  $scope.$watch(function() { return $cookies.get('username'); }, function(newValue) {
    var username = $cookies.get('username');
    $scope.loggedIn = !!username;
    $scope.username = username;
    $scope.showDropdown = false; 
  });

});
 