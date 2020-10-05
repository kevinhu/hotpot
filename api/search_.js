const { index } = require("./flexsearch/settings.js");

var fs = require("fs");

const BSON = require("bson");

console.time("index_load");
const indexFile = require("./index.json");
console.timeEnd("index_load");

console.time("index_import");
index.import(indexFile, { serialize: false });
console.timeEnd("index_import");

const query = "hello";

const results = index.search(query, {
	limit: 10,
	// threshold: 5,
	// depth: 3,
});

console.log(results);
