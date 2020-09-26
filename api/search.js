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

index.import(require("./index.json"), { serialize: false });

exports.handler = async (event, context) => {
	const query = event.queryStringParameters.query;

	var results = index.search(query, {
		limit: 10,
		// threshold: 5,
		// depth: 3,
	});

	console.log(index.info());

	// let fuzzyResults = fuzzysort.go(query, SearchData, {
	// 	keys: [
	// 		"toneless_pinyin",
	// 		"short_definition",
	// 		"simplified",
	// 		"traditional",
	// 		"pinyin",
	// 	],
	// 	allowTypo: false,
	// 	limit: 8,
	// 	threshold: -100,
	// });
	// fuzzyResults = fuzzyResults.sort((a, b) =>
	// 	a.obj.rank >= b.obj.rank ? 1 : -1
	// );

	return {
		statusCode: 200,
		body: JSON.stringify(results),
	};
};
