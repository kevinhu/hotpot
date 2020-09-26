var FlexSearch = require("./flexsearch.min.js");

const SearchData = require("./search_data.json");

var index = new FlexSearch({
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
			"definition",
			"simplified",
			"traditional",
			"pinyin",
			"toneless_pinyin",
		],
	},
});

index.add(SearchData);

fs.writeFile("index.json", index.export(), "utf8", function (err) {
	if (err) return console.log(err);
});
