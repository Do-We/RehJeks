angular.module('rehjeks.leaderboard', [
  'ngCookies'
])

  .controller('leaderBoardController', function ($scope, Server, $cookies, $sce) {
    $scope.username = $cookies.get('username');
    $scope.leaders = [];
    $scope.filteredleaders = [];

    $scope.getUsers = function () {
      //grab all users from the database
      Server.getUsers($scope)
        .then(function () {
          var counter = 0;
         //after the promise is returned, sort by user's score
          $scope.leaders.sort(function (a, b) {
            return b.score - a.score;
          }).forEach(function (item) {
          //create an index key equal to the counter to keep track of position in array
            item.index = counter;
            // then we increment our counter
            counter++;
          })
          //iterate over the now sorted array of objects
          for (var i = 0; i < $scope.leaders.length; i++) {
            //check if current index is equal to current user
              //if true and user is within the top 10
                //return the first 10 entries
            if ($scope.leaders[i].username === $scope.username && i < 10) {
              return $scope.filteredleaders = $scope.leaders.slice(0, 10);
            }
              // if true and user is not in the top 10
                //check if user has 9 users below them
                  // if true return the users position with the 9 after them 
            else if ($scope.leaders[i].username === $scope.username && !!$scope.leaders[i + 9] && i >= 10) {
              return $scope.filteredleaders = $scope.leaders.slice(i - 1, i + 9);
            }
              // lastly if the first two condition are false, but the user exist
                // return the last ten entries
            else if ($scope.leaders[i].username === $scope.username && !$scope.leaders[i + 9]) {
              return $scope.filteredleaders = $scope.leaders.slice($scope.leaders.length - 10, $scope.leaders.length);
            }
          }
        })
    }

    $scope.findUser = function (user) {
      if (user.username === $scope.username) {
        return true;
      }
    }

    $scope.$watch(function () { return $cookies.get('username'); }, function () {
      var username = $cookies.get('username');
      $scope.username = username;
    });
  })