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
console.log(process.env);
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : process.env.DBUSER,
  password : process.env.DBPASS,
  database : "wny_votes"
});

connection.connect(function(err) {
  // connected! (unless `err` is set)
  if (err == null) {
      console.log("connected");
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

app.post('/register', function(req, res) {
    res.send('{status:"recieved"}');
});

app.get('/representatives', function(req, res) {
	city = req.query.city.toLowerCase();

    town = null;

    var query = connection.query('SELECT town FROM municipalities WHERE LCASE(municipality) = "'+city+'"', function(err, result) {
          // Neat!
          console.log(err);
          console.log(query.sql);
          console.log(result);
          town = result[0].town;
    });

    var query = connection.query('SELECT * FROM offices WHERE LCASE(municipality) LIKE "%'+
                    city+'%" or LCASE(municipality) in ("erie county","erie county legislators");', function(err, result) {
          // Neat!
          console.log(err);
          console.log(query.sql);
          console.log(result);
          res.json(result);
    });


});


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
