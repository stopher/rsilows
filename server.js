// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
const morgan = require('morgan');
var fs = require('fs');
const path = require('path');
var csvjson = require('csvjson');

const schedule = require('node-schedule');





// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router



var http = require('http');
var fs = require('fs');

const API = 'http://www.netfonds.no/quotes/kurs.php';
const DEFAULT_QUERY = '?exchange=OSE&sec_types=&sectors=&ticks=&table=tab&sort=alphabetic';

let dataArr = [];

function getNewFile() {
	const d = new Date();
	const date = d.toLocaleDateString();
	const filename = date+".csv";
	if (!fs.existsSync(filename)) {
		console.log('file did not exist')
		var file = fs.createWriteStream(filename);
		var request = http.get(API+DEFAULT_QUERY, function(response) {
			console.log('file written..')
		  response.pipe(file);
		});
	} else {
			console.log('file exists..')
	}
	var data = fs.readFileSync(filename, { encoding : 'utf8'});
	var options = {
	  delimiter : '\t'
	};
	dataArr = csvjson.toArray(data, options);




	if(process.env.dbhost) {
		var con = mysql.createConnection({
		  host: process.env.dbhost,
		  user: process.env.dbuser,
		  password: process.env.dbpass,
		  database : process.env.dbname
		});		

		con.connect(function(err) {
	  		if (err) throw err;
	  		console.log("Connected to database!");
		});

		connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
		  if (error) throw error;
		  console.log('The solution is: ', results[0].solution);
		});
 
		connection.end();
	}

	

}

getNewFile();
schedule.scheduleJob('0 20 * * *', () => { 
	console.log("Running scheduled Job");
	getNewFile();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ data: dataArr });   
});
app.use('/api', router);

app.use(express.static(path.resolve(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);