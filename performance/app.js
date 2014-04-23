angular.module('PerformanceTool', []);

angular.module('PerformanceTool').controller('Main', ['$scope', 'performanceDataService',
    function($scope, performanceDataService) {
        $scope.loadFile = function() {
            performanceDataService.get("quickfit_87094c65-1c28-45e1-817a-bfe94c402da6")
                .then(function(response) {
                    $scope.results = response;
                }, function(error) {
                    console.log(error);
                });
        };
    }
]);
