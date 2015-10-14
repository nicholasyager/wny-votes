var request = require("request");
var pdfFiller = require('pdffiller'); 
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var sourcePDF = "public/pdf/vote_en.pdf";


var FDF_data = pdfFiller.generateFDFTemplate( sourcePDF, function(err, fdfData) { 
    if (err) throw err;
    console.log(fdfData);
});


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

app.get('/candidates', function(req, res) {

    var query = connection.query('SELECT * FROM candidates ' +
            'LEFT OUTER JOIN municipalities ON municipalities.town = candidates.municipality '+
            'WHERE municipalities.town = "'+req.query.municipality+'" OR '+
            'candidates.municipality LIKE "%Erie%"', function(err, result) {
                // Neat!
                if (result.length < 1) {
                    res.status(400).send("Location not found. Please try again.");
                    return;
                }

                res.json(result);
            });
});

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

app.get("/pollingLocation", function(req, res) {
    request.get("https://www.elections.erie.gov/ce/mobile/seam/resource/rest/precinct/precinctdetail?precinctId="+req.query.precinct,
            { headers : {
                            "User-Agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"
                        }
            }, function(err, response, body) {

                if (err != null || response.statusCode != 200) {
                    console.log(err);
                    res.status(500).send(response);
                    return;
                }

                raw_data = JSON.parse(body);
                res.json(raw_data);
            });

});


app.get("/office", function(req, res) {
    request.get("https://www.elections.erie.gov/ce/mobile/seam/resource/rest/voter/getelectedofficials?precinctId="+req.query.precinct,
            { headers : {
                            "User-Agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36"
                        }
            }, function(err, response, body) {
                if (err != null) {
                    res.status(500).send(response);
                    return;
                }
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
                data = JSON.parse(body);
                res.json(data.streets);
            });
});

app.post('/register', jsonParser, function(req, res) {
    if (!req.body) return res.sendStatus(400);

    console.log(req.body);

    destinationFile = "public/pdf/"+ req.body.applicant.email +".pdf";

    console.log(req.body);

    res.json([]);
});


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
