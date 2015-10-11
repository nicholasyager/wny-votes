angular.module('wnyVotes', [])
.controller('Controller', function($scope, $http){

    $scope.search = function(location) {
        $scope.location = location;
        var responsePromise = $http.get("/precinct?number="+location.address+"&street="+location.street);

        responsePromise.success(function(data, status, headers, config) {

            $scope.alert = "";
            $scope.alertClass="";

            for (var i = 0; i < data.length; i++) {
                console.log(data[0]);
                if (data[i].zipcode == location.zipcode) {
                    $scope.location = data[i];
                    $scope.officeQuery($scope.location);
                    break;
                }
            }
        });

        responsePromise.error(function(data, status, headers, config) {
            $scope.alert = data;
            $scope.alertClass="has-error"
        });
    };

    $scope.officeQuery = function(location) {
        var responsePromise = $http.get("/office?precinct="+location.precinct);

        responsePromise.success(function(data, status, headers, config) {
            $scope.offices = data;
            for(var i = 0; i < data.length; i++) {
                $scope.officialsQuery(data[i], i);
            }
        });

        responsePromise.error(function(data, status, headers, config) {
            console.log(data);
            $scope.alert = data;
            $scope.alertClass="has-error"
        });

    };
    $scope.officialsQuery = function(office, i) {
        var responsePromise = $http.get("/official?officeId="+office.id);

        responsePromise.success(function(data, status, headers, config) {
            for(var x = 0; i < $scope.offices.length; x++) {
                if ($scope.offices[x].id == office.id) {
                    console.log(data);
                    console.log(office);
                    console.log($scope.offices);
                    $scope.offices[x].person = data;
                    if (data.politicalParty == "DEM") {
                        $scope.offices[x].person.politicalParty = "primary";
                    } else if (data.politicalParty == "REP") {
                        $scope.offices[x].person.politicalParty = "danger";
                    } else {
                        $scope.offices[x].person.politicalParty = "success";
                    }
                    break;
                }
            }
        });

        responsePromise.error(function(data, status, headers, config) {
            console.log(data);
            $scope.alert = data;
            $scope.alertClass="has-error"
        });

    };

})
.filter('capitalize', function() {
    return function(input, scope) {
        if (input!=null)
            return input.substring(0,1).toUpperCase()+input.substring(1);
    }
});