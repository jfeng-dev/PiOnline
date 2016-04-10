"use strict";
var request = require("request");
var config = require("./config.js");
// var cache = require("./cache.js");
let dnsZones = [];
let hostIP = '';

function makeRequest(url,  method) {
	let options = {
		headers : {
			"Content-Type" : "application/json",
			"X-Auth-Key" : config.apiKey,
			"X-Auth-Email": config.email
		},
		url : config.baseUrl + url,
		method : method,
	};

	return new Promise( (resolve, reject) => {
		request(options, (err, res, body) => {
			let response = JSON.parse(body);
			if (!response.success) {
				reject(response.errors);
			} else {
				resolve(response.result);
			}});
	});
}

function getZones() {
	return makeRequest('zones',  'GET')
	.then((result) => {
		result.forEach( (val) => {
			dnsZones.push({id : val.id});
		});
		return dnsZones;
	})
	.catch( (err) => {
		console.log(err);
	});
}

function getHostIP() {
	return new Promise( (resolve, reject)  => {
		request(config.getIP, (err, res, body) => {
			if (!err) {
				resolve(body);
			}  else {
				reject(err);
			}
		});
	})
	.then( (ip) => {
		hostIP = ip;
		return ip;
	})
	.catch( (err) => {
		console.log(err);
	});
}

function getZoneRecords(zones) {
	let recordRequests = zones.map( (zone, idx, array) => {
		let url = 'zones/' + zone.id + '/dns_records';
		return makeRequest(url, 'GET')
		.then( (records) => {
			let aRecord = records.find( (rec) => {
				if (rec.type == 'A') {
					return true;
				}
			});
			array[idx].recordId = aRecord.id;
			return {
				zoneId : aRecord.zone_id,
				recordId : aRecord.id
			};
		});
	});
	return Promise.all(recordRequests);
}

function updateRecordValue(dnsRecords) {
	let updateRequests = dnsRecords.map( (req) => {
		let url = 'zones/' + req.zoneId + '/dns_records/' + req.recordId;
		let data = {
			'content' : hostIP
		};
		return makeRequest(url, 'PUT', data);
	});
	return Promise.all(updateRequests);
}

getZones().then(getZoneRecords).then(updateRecordValue)
.then( (updates) => {
	console.log(updates);
})
.catch( (err)  =>{
	console.log(err);
})