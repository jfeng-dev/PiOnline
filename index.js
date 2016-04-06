"use strict";
var config = require("./config.js");
var request = require("request");

let BASE_URL = "https://api.cloudflare.com/client/v4/";
let options = {
	headers : {
		"Content-Type" : "application/json",
		"X-Auth-Key" : config.apiKey,
		"X-Auth-Email": config.email
	}
};

function makeRequest(url, cb) {
	options.url = BASE_URL + url;
	request.get(options, cb);
}
