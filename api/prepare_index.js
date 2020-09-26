var FlexSearch = require("./flexsearch/flexsearch.min.js");
var fs = require("fs");

const SearchData = require("./search_data.json");

var index = new FlexSearch({
	threshold: 8,
	resolution: 9,
	depth: 1,
	async: false,
	worker: false,
	cache: true,
	doc: {
		id: "id",
		field: {
			definition: {
				encode: "advanced",
			},
			simplified: {
				encode: false,
				tokenize: function (str) {
					return str.replace(/[\x00-\x7F]/g, "").split("");
				},
			},
			traditional: {
				encode: false,
				tokenize: function (str) {
					return str.replace(/[\x00-\x7F]/g, "").split("");
				},
			},
			pinyin: {
				encode: "advanced",
			},
			toneless_pinyin: {
				encode: "advanced",
			},
		},
	},
});

index.add(SearchData);

fs.writeFile("index.json", index.export(), "utf8", function (err) {
	if (err) return console.log(err);
});
