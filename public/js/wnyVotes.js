angular.module('wnyVotes', [])
.controller('Controller', function($scope, $http, $location, $anchorScroll){

	$scope.search = function(location) {
		$scope.location = location;
		var responsePromise = $http.get("/precinct?number="+location.address+"&street="+location.street);

		responsePromise.success(function(data, status, headers, config) {

			$scope.alert = "";
			$scope.alertClass="";

			for (var i = 0; i < data.length; i++) {
				if (data[i].zipcode == location.zipcode) {
					$scope.location = data[i];
					$scope.pollingQuery($scope.location);
					$scope.candidateQuery($scope.location);
					$location.hash('meetCandidates');
					$anchorScroll();
					break;
				}
			}
		});

		responsePromise.error(function(data, status, headers, config) {
			$scope.alert = data;
			$scope.alertClass="has-error"
		});
	};

	$scope.candidateQuery = function(location) {
		var responsePromise = $http.get("/candidates?municipality="+location.city.toLowerCase());
		responsePromise.success(function(data, status, headers, config) {
			for (var i = 0; i < data.length; i ++) {
				data[i].party = data[i].party.substring(data[i].party.length - 3, data[i].party.length);
			}
			console.log(data);
			$scope.candidates = data;
		});

		responsePromise.error(function(data, status, headers, config) {
			console.log(data);
			$scope.alert = data;
			$scope.alertClass="has-error"
		});

	};

	$scope.pollingQuery = function(location) {
		console.log(location);
		var responsePromise = $http.get("/pollingLocation?precinct="+location.precinct);
		responsePromise.success(function(data, status, headers, config) {
			console.log(data);
			$scope.pollingLocations = [data];
		});

		responsePromise.error(function(data, status, headers, config) {
			console.log(data);
			$scope.alert = data;
			$scope.alertClass="has-error"
		});

	};

	$scope.register = function(applicant) {
		console.log(applicant);
		var responsePromise = $http.post("/register", applicant);

		responsePromise.success(function(data, status, headers, config) {


            //blob = new Blob([data], {type: "application/pdf;charset=utf-8"}),
            //saveAs(blob, "test.pdf");

            var win = window.open(data.url, '_blank');
            win.focus();

			$scope.applicantAlert = "";
			$scope.applicnatAlertClass="";

		});

		responsePromise.error(function(data, status, headers, config) {
			$scope.applicantAlert = data;
			$scope.applicantAlertClass="has-error";
		});

	}

	$scope.moveTo = function(id) {
		console.log(id);
		$location.hash(id);
		$anchorScroll();
	};



	/*
	   $scope.officeQuery = function(location) {
	   var responsePromise = $http.get("/office?precinct="+location.precinct);
	   responsePromise.success(function(data, status, headers, config) {
	   console.log(data);
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
	   */

})
.filter('capitalize', function() {
	return function(input, scope) {
		output = "";
		if (input!=null) {
			words = input.split(" ");
			for (var i = 0; i < words.length; i++){
				word = words[i];
				output += word.substring(0,1).toUpperCase()+word.substring(1)+" ";
			}
			return output.substring(0, output.length -1 );}
	}
});
