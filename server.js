'use strict';

const express    = require('express');        // call express
const app        = express();                 // define our app using express
const bodyParser = require('body-parser');

const path = require('path');
const csvjson = require('csvjson');

const schedule = require('node-schedule');
const mysql = require('mysql');

const ENV_HEADER_HOST = process.env.HEADER_HOST;
const ENV_HEADER_REFERER = process.env.HEADER_REFERER;
const ENV_OAX_LAST_PART = process.env.OAX_LAST_PART;
const ENV_OSE_LAST_PART = process.env.OSE_LAST_PART;
const ENV_ST_LAST_PART = process.env.ST_LAST_PART;
const ENV_TICKER_FIRST_PART = process.env.TICKER_FIRST_PART;

console.log(ENV_HEADER_HOST);
console.log(ENV_HEADER_REFERER);
console.log(ENV_OAX_LAST_PART);
console.log(ENV_OSE_LAST_PART);
console.log(ENV_ST_LAST_PART);
console.log(ENV_TICKER_FIRST_PART);

const RSI_URL = ENV_TICKER_FIRST_PART;
const OSE_LAST_PART = ENV_OSE_LAST_PART;
const OAX_LAST_PART = ENV_OAX_LAST_PART;
const ST_LAST_PART = ENV_ST_LAST_PART;


// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
const router = express.Router();              // get an instance of the express Router


const request = require('request');


function fromDBTickers() {
	if(process.env.dbuser) {
		var con = mysql.createConnection({
		  host: process.env.dbhost,
		  port: process.env.OPENSHIFT_MYSQL_DB_PORT,
		  user: process.env.dbuser,
		  password: process.env.dbpass,
		  database : process.env.dbname
		});		

		con.connect(function(err) {
	  		if (err) throw err;
		});


		 con.query("SELECT * FROM stocks", function (err, result, fields) {
		    if (err) throw err;
		    rsis = result;
		  });
 
		con.end();
	} else {
		console.log("no db/ no db user");
	}
}


function updateTicker(ticker, rsi) {
	if(process.env.dbuser) {
		var con = mysql.createConnection({
		  host: process.env.dbhost,
		  port: process.env.OPENSHIFT_MYSQL_DB_PORT,
		  user: process.env.dbuser,
		  password: process.env.dbpass,
		  database : process.env.dbname
		});		

		con.connect(function(err) {
	  		if (err) throw err;
		});

		 var sql = "REPLACE INTO stocks (ticker, rsi) VALUES ("+con.escape(ticker)+", "+con.escape(rsi)+")";
  		 con.query(sql, function (err, result) {
		  if (err) throw err;
		  console.log(result.affectedRows + " record(s) updated");
		});
 
		con.end();
	} else {
		console.log("no db/ no db user");
	}
}

function createTablesIfNotExists() {
	if(process.env.dbuser) {
		var con = mysql.createConnection({
		  host: process.env.dbhost,
		  port: process.env.OPENSHIFT_MYSQL_DB_PORT,
		  user: process.env.dbuser,
		  password: process.env.dbpass,
		  database : process.env.dbname
		});		

		con.connect(function(err) {
	  		if (err) throw err;
		});

		con.query('CREATE TABLE IF NOT EXISTS stocks (ID int NOT NULL AUTO_INCREMENT, ticker VARCHAR(255) NOT NULL, rsi decimal(60,30), PRIMARY KEY (ID), unique(ticker))', function (error, results, fields) {
		  if (error) throw error;
		});
 
		con.end();
	} else {
		console.log("no db/ no db user");
	}
}


createTablesIfNotExists();


const stTicker = ['STAR-B', 'PDX', 'THQN-B', 'SF'];
const oaxTickers = ["APCL", "HUGO", "SAGA", "PCIB", "NORTH", "UMS", "ALNG", "HBC", "NOM", "AEGA", "HUNT", "MSEIS", "AWDR"];
const oseTickers = ["FUNCOM", "NAS", "REC", "TEL", "MHG", "KOMP", "FRO", "DNB", "MHG", "STL", "SUBC", "GOGL", "AKERBP", "YAR", "SBANK", "ELE", "PGS", "TGS", "NONG", "GJF", "BWLPG", "AKER", "ORK", "LSG", "STB", "BWO", "AVANCE", "NOD", "AKSO", "AXA", "QEC", "BAKKA", "IOX", "SALM", "WWL", "AUSS", "SCHA", "ENTRA", "NOFI", "KOG", "TOM", "THIN", "BRG", "NRS", "SNI", "SRBANK", "ARCHER", "KIT", "ODL", "MING", "OCY", "EPR", "NANO", "NEL", "XXL", "VEI", "SPU", "GSF", "KVAER", "SSO", "SOFF", "BDRILL", "GIG", "PLCS", "BGBIO", "FJORD", "KOA", "HLNG", "TRVX", "WWI", "EVRY", "DOF", "AMSC", "ATEA", "PROTCT", "ASC", "SONG", "OPERA", "BOUVET", "SDRL", "SBO", "SSG", "PHO", "IMSK", "JIN", "HAVI", "KID", "AKA", "ZAL", "SDSD", "WSTEP", "EMGS", "BIOTEC", "TTS", "SIOFF", "OTS", "APP", "CXENSE", "DAT"];
let rsis = [];
function addTicker(ticker, rsival) {
	rsis.push({ticker: ticker, rsi: rsival});
}

function fetchRsi(ticker, lastPart) {

	const options = {
	  url: RSI_URL+ticker+lastPart,
	  headers: {
	  	'Host': ENV_HEADER_HOST,
		'Referer': ENV_HEADER_REFERER,
		'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
	  }
	};

	request.get(options, (error, response, body) => {
		const b = body.split("jsonCallback(")[1];
		const b2 = b.substring(0, b.length-2);
		const parsedResponse = JSON.parse(b2);
		const lastRsi = parsedResponse.values[parsedResponse.values.length-1];
		const rsi = parseFloat(lastRsi[1]);
		const tickerPos = rsis.find(x => {
			return x.ticker === ticker;
		});
		if(tickerPos == undefined || tickerPos < 0) {
			rsis.push({ticker: ticker, rsi: rsi});
		} else {
			rsis = rsis.map(function(item) { return item.ticker == ticker ? {ticker:ticker, rsi: rsi} : item; });
		}
		updateTicker(ticker, rsi);
	});

}

function* oaxFunc() {
  	for(let item of oaxTickers) {
    	yield item;
  	}
}

function* oseFunc() {
  	for(let item of oseTickers) {
    	yield item;
  	}
}

function getFreshOaxRSIs() {
	console.log("get fresh oax rsis");
	let genObj = oaxFunc();
	let interval = setInterval(() => {
		let val = genObj.next();
		if (val.done) {
		    clearInterval(interval);
		} else {
		    fetchRsi(val.value, OAX_LAST_PART);
		}
	}, 16000);
}

function getFreshOseRSIs() {
	console.log("get fresh ose rsis");
	let genObj = oseFunc();
	let interval = setInterval(() => {
		let val = genObj.next();
		if (val.done) {
		    clearInterval(interval);
		} else {
		    fetchRsi(val.value, OSE_LAST_PART);
		}
	}, 13000);
}
 

const tickersSchedule = schedule.scheduleJob('*/30 * * * *', function(fireDate){
  console.log('This ticker schedule was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
  fromDBTickers();
});

const oseSchedule = schedule.scheduleJob('10 17 * * *', function(fireDate){
  console.log('This ose rsi schedule was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
  getFreshOseRSIs();
});

const oaxSchedule = schedule.scheduleJob('20 17 * * *', function(fireDate){
  console.log('This oax rsi schedule was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
  getFreshOaxRSIs();
});

console.log(tickersSchedule.nextInvocation());
console.log(oseSchedule.nextInvocation());
console.log(oaxSchedule.nextInvocation());

function compare(a,b) {
  if (a.rsi < b.rsi)
    return -1;
  if (a.rsi > b.rsi)
    return 1;
  return 0;
}

router.get('/', function(req, res) {
	const responseData = rsis.sort(compare);
	const filteredData = responseData.filter(x => x.rsi < 50.0);
    res.json({ data: filteredData});   
});
app.use('/api', router);


fromDBTickers();

setTimeout(function() {
	fetchRsi('FUNCOM', OSE_LAST_PART);
},10000);


app.use(express.static(path.resolve(__dirname, 'frontend', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);