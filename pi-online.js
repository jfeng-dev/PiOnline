"use strict";
var request = require("request");
var config = require("./config/config.js");
var cache = require("./lib/cache/cache.js");
let dnsZones = [];
let hostIP = '';
let Cache = new cache(config.cacheFile);

function makeRequest(url,  method, data) {
	let options = {
		headers : {
			"Content-Type" : "application/json",
			"X-Auth-Key" : config.apiKey,
			"X-Auth-Email": config.email
		},
		url : config.baseUrl + url,
		method : method,
		json: true,
	};

	if (data) {
		options.body = data;
	}
	return new Promise( (resolve, reject) => {
		request(options, (err, res, body) => {
			let response = body;
			if (!response.success) {
				reject(response.errors);
			} else {
				resolve(response.result);
			}});
	});
}

function getZones() {
	console.log('Getting your dns zones.');
	if (dnsZones != null && dnsZones.length > 0) {
		return dnsZones;
	}

	return makeRequest('zones',  'GET')
	.then((result) => {
		result.forEach( (val) => {
			dnsZones.push({
				id : val.id,
				fqdn: val.name,
			});
		});
		return dnsZones;
	});
}

function getHostIP(ip) {
	console.log('Getting your ip address.');
	if (hostIP == ip) {
		throw {
			success: true,
			message : "Your IP address hasn't changed. Nothing to do here."
		};
	}

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
		hostIP = ip.trim();
		return ip;
	});
}

function getZoneRecords(zones) {
	console.log('Getting A records of your dns zones.');
	if (zones[0].recordId) {
		return zones;
	}

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
				id : aRecord.zone_id,
				recordId : aRecord.id,
				fqdn : aRecord.name,
			};
		});
	});
	return Promise.all(recordRequests);
}

function updateRecordValue(dnsRecords) {
	console.log('Updating your A records with your new IP address');
	let updateRequests = dnsRecords.map( (req) => {
		let url = 'zones/' + req.id + '/dns_records/' + req.recordId;
		let data = {
			'content' : hostIP,
			'type' : 'A',
			'name' : req.fqdn,
		};
		return makeRequest(url, 'PUT', data);
	});
	return Promise.all(updateRequests)
		.catch( (err) => {
			console.trace(err);
			throw err;
		});
}

function loadCache() {
	console.log('Loading IP and DNS zone cache.');
	return Cache.load()
	.then( (data) => {
		dnsZones = data.dnsZones;
		return data.hostIP;
	});
}

function saveCache() {
	console.log('Saving cache for next time');
	return Cache.write({
		hostIP : hostIP,
		dnsZones : dnsZones
	});
}

function run() {
	console.log('Starting IP update.');
	loadCache()
	.then(getHostIP)
	.then(getZones)
	.then(getZoneRecords)
	.then(updateRecordValue)
	.then(saveCache)
	.then( _ => {
		console.log('Finished.');
	})
	.catch( (err) => {
		console.log('Womp. There was an error updating your DNS records.');
		err.forEach( (error) => {
			console.log(error);
		})
	});
}

setTimeout(run, config.refreshTime);

process.on('SIGTERM', function() {
	saveCache().then( _ => {
		console.log('Shutting down.');
		process.exit();
	});
});
