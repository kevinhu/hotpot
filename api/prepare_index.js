const SearchData = require("./search_data.json");
// const fuzzysort = require("fuzzysort");
var FlexSearch = require("flexsearch");
fs = require("fs");

var index = new FlexSearch({
	// default values:

	encode: "icase",
	threshold: 8,
	resolution: 9,
	depth: 1,
	async: false,
	worker: false,
	cache: true,
	doc: {
		id: "id",
		field: [
			"toneless_pinyin",
			"short_definition",
			"simplified",
			"traditional",
			"pinyin",
		],
	},
});

index.add(SearchData);

fs.writeFile("index.json", index.export(), "utf8", function (err) {
	if (err) return console.log(err);
});
