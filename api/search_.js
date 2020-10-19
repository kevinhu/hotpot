const { index } = require("./flexsearch/settings.js");

console.time("index_load");
const indexFile = require("./index.json");
console.timeEnd("index_load");

console.time("index_import");
index.import(indexFile, { serialize: false });
console.timeEnd("index_import");

const query = "huo guo";

const results = index.search(query, {
	limit: 100,
	sort: "rank",
	// threshold: 5,
	// depth: 3,
});

console.log(results.slice(0, 5));
