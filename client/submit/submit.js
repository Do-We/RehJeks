angular.module('rehjeks.submit', [])
  .controller('SubmitController', function ($scope, $http, Server, RegexParser, $sanitize) {

    let submitData = {};
    //saving blank form as originForm
    $scope.originForm = angular.copy($scope.submitData);
    $scope.resetForm = function() {
      $scope.submitData = angular.copy($scope.originForm);
      // Assign clear state to modified form
      $scope.submitForm.$setPristine();
    };

    var checkIfSanitary = function() {
      return $scope.submitData.text === $sanitize($scope.submitData.text);
    };

    $scope.submit = function() {
      if (checkIfSanitary()) {
        Server.submitNewChallenge($scope)
        .then(resp => {
          $scope.unsanitary = false;
          $scope.submitted = true;
          $scope.resetForm();
        });
      } else {
        $scope.unsanitary = true;
        $scope.submitData.text = $sanitize($scope.submitData.text);
      }
    };

    $scope.onUpdate = function() {
      if (!!$scope.submitData.answer && !!$scope.submitData.text) {
        let regexAnswer = RegexParser($scope.submitData.answer);
        $scope.submitData.expected = function() {
          let textString = $scope.submitData.text;
          return textString.match(regexAnswer);
        };
      } 
   
    };
  });
