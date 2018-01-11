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


const KURSER_PART1 = 'http://www.netfonds.no/quotes/kurs.php';
const CSV_PART = '?exchange=OSE&sec_types=&sectors=&ticks=&table=tab&sort=alphabetic';


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

const tickers = ["FUNCOM", "NAS", "REC", "APCL", "MHG", "KOMP"];
const rsis = [];
function addTicker(ticker, rsival) {
	rsis.push({ticker: ticker, rsi: rsival});
}

addTicker("FUNCOM", 30.1);
addTicker("REC", 20.1);
addTicker("NAS", 10.1);

function fetchRsi(ticker) {
	var request = http.get(RSI_URL+ticker+RSI_LAST_PART, function(response) {
		console.log('got rsi for:'+ticker);

		const b = response.split("jsonCallback(")[1];
		const b2 = b.substring(0, b.length-2);
		const parsedResponse = JSON.parse(b2);
		const lastRsi = b3.values[b3.values.length-1];
		const rsi = parseFloat(lastRsi[1]);

		const tickerPos = rsis.find(x => {
			return x.ticker === ticker;
		});

		if(tickerPos < 0) {
			rsis.push({ticker: ticker, rsi: rsi});
		} else {
			rsis[tickerPos] = {ticker: ticker, rsi: rsi};
		}
	});
}


function fetchTickers(ticker) {
	const request = http.get(KURSER_PART1+CSV_PART, function(response) {
		console.log('got tickers');
		const options = {
		  delimiter : '\t'
		};
		const myTickers = [];
		const dataArr = csvjson.toArray(data, options);

		dataArr.forEach(x => {
			const ticker = x[1];
			if(ticker) {
				if(tickers.indexOf(ticker) < 0) {
					tickers.push(ticker);					
				}
			}
		});
	});
}

let genObj = genFunc();

function* genFunc() {
  for(let item of tickers) {
    yield item;
  }
}

function getFreshRSIs() {
	let interval = setInterval(() => {
	  val = genObj.next();
	  if (val.done) {
	    clearInterval(interval);
	  } else {
	    fetchRsi(val.value);
	  }
	}, 10000);
}

const tickersSchedule = schedule.scheduleJob('* * 18 * * *', function(fireDate){
  console.log('This ticker schedule was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
  //fetchTickers();
});

const rsiSchedule = schedule.scheduleJob('* 45 22 * * *', function(fireDate){
  console.log('This rsi schedule was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
  getFreshRSIs();
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

fetchRsi("FUNCOM");

app.use(express.static(path.resolve(__dirname, 'frontend', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);