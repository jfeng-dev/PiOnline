"use strict";
var config = require("./config.js");
var request = require("request");
var endpoints = require("./endpoints.js");

var zones = [];

let BASE_URL = "https://api.cloudflare.com/client/v4/";
let options = {
	headers : {
		"Content-Type" : "application/json",
		"X-Auth-Key" : config.apiKey,
		"X-Auth-Email": config.email
	}
};

function makeRequest(url,  method) {
	options.url = BASE_URL + url;
	options.method = method;

	return new Promise( (resolve, reject) => {
		request(options, (err, res, body) => {
			let response = JSON.parse(body);
			if (!response.success) {
				reject(response.errors);
			}
			resolve(response.result);
			});
	});
}

function getZones() {
	makeRequest(endpoints.zones,  'GET').then((result) => {
		result.forEach(val) {
			zones.push(id);
		}
	})
	.catch( (err) => {
		console.log(err);;
	})
}

