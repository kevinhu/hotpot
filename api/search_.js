const { index } = require("./flexsearch/settings.js");

var fs = require("fs");

const BSON = require("bson");

const simdjson = require("simdjson");

console.time("index_load");
const indexFile = require("./index.json");

// const indexFile = fs.readFileSync("./index.json");

// const indexBuffer = fs.readFileSync("./index.json");
console.timeEnd("index_load");

// console.time("index_parse");
// const indexFile = JSON.parse(indexBuffer);

// const indexFile = simdjson.lazyParse(indexBuffer);

// var indexFile = new FastJson();
// indexFile.write(indexBuffer);
// console.log(indexFile[0]);
// console.timeEnd("index_parse");

console.time("index_import");
index.import(indexFile, { serialize: false });
console.timeEnd("index_import");

const query = "hello";

const results = index.search(query, {
	limit: 10,
	// threshold: 5,
	// depth: 3,
});

console.log(results[0]);
