var documentKey = '0AgzkULHq1yvxdHZkRktpd2gxT1diaDQ2OU5WTXZHVUE';
var myapp = angular.module('App', []);
myapp.factory('issues', function($http) {
    var url = "https://docs.google.com/spreadsheet/pub?key=" + documentKey +"&single=true&gid=1&output=csv";
    var object = {data:null};

    $http.get(url).success(function(response) {
        var rows = CSVToArray( response);
        var categoryIds = [];
        var idx = 0;
        object.data = [];

        for (var i = 1; i < rows.length; i++) //Init i to 1 to skip first row with headers.
        {
            var category = rows[i][0];
            var issue = rows[i][1];
            var issueId = rows[i][2];
            var selected = rows[i][3];
            
            if (categoryIds[category] == null )
            {
                categoryIds[category] = idx++;    
            }

            var categoryId = categoryIds[category];
            if (object.data[categoryId] == null) {
                object.data[categoryId] = { name: category, selected: false, issues: [] };
            }
            if (selected == 'TRUE') {
              object.data[categoryId].selected = true; 
            }
            object.data[categoryId].issues.push({name:issue, id:issueId});
        }

        console.log('issue');
        console.log(object);
    });

    return object;
});

myapp.factory('candidates', function($http) {
    var url = "https://docs.google.com/spreadsheet/pub?key=" + documentKey +"&single=true&gid=0&output=csv";
    var object = {data:null};

    $http.get(url).success(function(response) {
        var rows = CSVToArray(response);
        object.data = [];

        for (var i = 1; i < rows.length; i++) //Init i to 1 to skip first row with headers.
        {
            var firstname = rows[i][0];
            var lastname =   rows[i][1];
            var party =   rows[i][2];
            var age =   rows[i][3];
            var sex =   rows[i][4];
            var race =   rows[i][5];
            var ethnicity = rows[i][6];
            var pic = rows[i][7];
            var fullname = rows[i][8];
            var id = rows[i][9];
            var selected = (rows[i][10] == 'TRUE') ;
            var generalelection = (rows[i][11] == 'TRUE') ;

            var candidate = {
               firstname: firstname,
               lastname: lastname,
               party: party,
               age: age,
               sex: sex,
               race: race,
               ethnicity: ethnicity,
               pic: pic,
               fullname: fullname,
               id: id,
               selected: selected,
               generalelection: generalelection
            };
		
            object.data[id] = candidate;
        }

    });

    return object;
});

myapp.factory('positions', function($http) {
    var url = "https://docs.google.com/spreadsheet/pub?key=" + documentKey +"&single=true&gid=2&output=csv";
    var object = {data:null};

    $http.get(url).success(function(response) {
        var rows = CSVToArray(response);

        object.data = [];

        for (var i = 1; i < rows.length; i++) //Init i to 1 to skip first row with headers.
        {
            var issueId = rows[i][3];
            var candidateId = rows[i][4];
            var position = rows[i][2];

            if (object.data[issueId] == null )
            {
                object.data[issueId] = [];
            }
            object.data[issueId][candidateId] = position;
        }
        //console.log(object);
    });

    return object;
});


function OnTheIssuesContoller($scope, issues, candidates, positions) {
  $scope.issues = issues;
  $scope.candidates = candidates;
  $scope.positions = positions;
}

//https://raw.github.com/angular-ui/ui-utils/master/modules/unique/unique.js
/**
 * Filters out all duplicate items from an array by checking the specified key
 * @param [key] {string} the name of the attribute of each object to compare for uniqueness
 if the key is empty, the entire object will be compared
 if the key === false then no filtering will be performed
 * @return {array}
 */
myapp.filter('unique', ['$parse', function ($parse) {

  return function (items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [],
        get = angular.isString(filterOn) ? $parse(filterOn) : function (item) { return item; };

      var extractValueToCompare = function (item) {
        return angular.isObject(item) ? get(item) : item;
      };

      angular.forEach(items, function (item) {
        var valueToCheck, isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
}]);


// http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
        "gi"
    );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [
        []
    ];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
            ) {

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);

        }


        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]) {

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp("\"\"", "g"),
                "\""
            );

        } else {

            // We found a non-quoted value.
            var strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push(strMatchedValue);
    }

    // Return the parsed data.
    return( arrData );
}