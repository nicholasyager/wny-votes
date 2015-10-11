var request = require("request");
var pdfFiller = require('pdffiller'); 
var express = require('express');
var app = express();

var sourcePDF = "public/pdf/vote_en.pdf";

/*
   var FDF_data = pdfFiller.generateFDFTemplate( sourcePDF, function(err, fdfData) { 
   if (err) throw err;
   console.log(fdfData);
   });
   */
/*
   var mysql      = require('mysql');
   var connection = mysql.createConnection({
   host     : '192.168.0.111',
   user     : process.env.DBUSER,
   password : process.env.DBPASS,
   database : "wny_votes"
   });

   connection.connect(function(err) {
// connected! (unless `err` is set)
if (err == null) {
console.log("Connected to MySQL DB.");
} else {
console.log(err);
}
});
*/

var testCandidates = {
    candidates : [
    {
        name : "Joseph Stalin",
        image : "http://www.superileri.com/wp-content/uploads/2014/12/Josef-Stalin-Headshot.jpg"}, 
    {
        name : "Vlad Lenin",
        image : "http://a3.files.biography.com/image/upload/c_fill,cs_srgb,dpr_1.0,g_face,h_300,q_80,w_300/MTIwNjA4NjMzODgyNTEwODYw.jpg"
    }
    ]}

    app.use(express.static('public'));

    // respond with "hello world" when a GET request is made to the homepage
    app.get('/', function(req, res) {
        res.send('hello world');
    });

app.post('/register', function(req, res) {
    res.send('{status:"recieved"}');
});
/*
   app.get('/representatives', function(req, res) {
   city = req.query.city.toLowerCase();


   var query = connection.query('SELECT town FROM municipalities WHERE LCASE(municipality) = "'+city+'"', function(err, result) {
// Neat!
console.log(err);
console.log(query);
console.log(result);
if (result.length < 1) {
res.status(400).send("Location not found. Please try again.");
return;
}
town = result[0].town;  
var query = connection.query('SELECT * FROM offices WHERE LCASE(municipality) LIKE "%'+
city+'%" or LCASE(municipality) in ("erie county","erie county legislators") order by sortOrder desc;', function(err, result) {
// Neat!
console.log(err);
console.log(query.sql);
console.log(result);
res.json(result);
});

});

});
*/

app.get("/official", function(req, res) {
    request.get("https://www.elections.erie.gov/ce/mobile/seam/resource/rest/voter/getelectedofficial?officeId="+req.query.officeId,
            { headers : {
                            "User-Agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"
                        }
            }, function(err, response, body) {
                json = JSON.parse(body.substring(5, body.length - 1));
                json.person.politicalParty = json.office.officeHolder.politicalParty.partyAbbreviation;
                res.json(json.person);
            });
});


app.get("/office", function(req, res) {
    request.get("https://www.elections.erie.gov/ce/mobile/seam/resource/rest/voter/getelectedofficials?precinctId="+req.query.precinct,
            { headers : {
                            "User-Agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"
                        }
            }, function(err, response, body) {
                console.log(body);
                raw_data = JSON.parse(body.substring(5,body.length - 1));

                officials = [];

                for (var districtIndex = 0; districtIndex < raw_data.districts.length; districtIndex++) {

                    district = raw_data.districts[districtIndex];
                    for (var officeIndex = 0; officeIndex < district.offices.length; officeIndex++) {
                        office = district.offices[officeIndex];
                        var official = {
                            level : office.district.level.sortOrder,
                            id : office.id,
                            district : office.district.name.englishText,
                            title   :  office.internalDisplay,
                            website : office.website,
                            sort : office.district.sortOrder,
                        };
                        officials.push(official);
                    }

                }

                console.log(officials);
                res.json(officials);
            });

});

app.get('/precinct', function(req, res) {
    request.post("https://www.elections.erie.gov/ce/mobile/seam/resource/rest/precinct/findstreet",
            {form : {PRECINCT_FINDER_ADDRESS_NUMBER :   req.query.number,
                        PRECINCT_FINDER_PRE_DIRECTION  :   "",
                        PRECINCT_FINDER_STREET_NAME    :   req.query.street,
                        PRECINCT_FINDER_STREET_TYPE    :   "",
                        PRECINCT_FINDER_POST_DIRECTION :   "",
                        lang                           :   "en"
                    },
                headers : {
                    "User-Agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"
                }
            }, function(err, response, body) {
                console.log(body);
                data = JSON.parse(body);
                res.json(data.streets);
            });
});

app.get('/candidates', function(req, res) {

    res.json([]);
});


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});