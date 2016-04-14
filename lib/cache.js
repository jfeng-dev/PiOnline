"use strict"
var fs = require('fs');

function Cache(path) {
	this.path = path;
} 

Cache.prototype.load = function () {
	return new Promise( (resolve, reject) => {
		fs.readFile(this.path,  (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(JSON.parse(data));
			}
		});
	});	
}

Cache.prototype.write = function (data) {
	let storeData = JSON.stringify(data);
	return new Promise( (resolve, reject) => {
		fs.writeFile(this.path, storeData, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve(true);
			}
		});
	});
}

module.exports = Cache;