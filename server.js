'use strict';
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
const mysql = require('mysql');


const RSI_URL = 'http://quotes.hegnar.no/plotaux.php?paper=';
const RSI_LAST_PART = '&exchange=OSE&from=&to=&period=&scale=linear&linewidth=1&candle=1&theme=white&intraday=history&datap=true&height=250&width=500&p_PERIOD=14&id=RELATIVE-STRENGTH-INDEX&jsonpart=3';


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

//testDb();
//createTablesIfNotExists();

//getNewFile();


const rsis = [];
function addTicker(ticker, rsival) {
	rsis.push({ticker: ticker, rsi: rsival});
}

addTicker("FUNCOM", 30.1);
addTicker("STAR", 20.1);
addTicker("NAS", 10.1);

function fetchRsi(ticker) {
	var request = http.get(RSI_URL+ticker+RSI_LAST_PART, function(response) {
		console.log('got response');
	});
}

var j = schedule.scheduleJob('*/5 * * * *', function(fireDate){
  console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
  //fetchRsi();
});

function compare(a,b) {
  if (a.rsi < b.rsi)
    return -1;
  if (a.rsi > b.rsi)
    return 1;
  return 0;
}

router.get('/', function(req, res) {

    res.json({ data: rsis.sort(compare)});   
});
app.use('/api', router);

fetchRsi();

app.use(express.static(path.resolve(__dirname, 'frontend', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);