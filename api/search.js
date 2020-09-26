var FlexSearch = require("./flexsearch.min.js");

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

index.import(require("./index.json"), { serialize: false });

exports.handler = async (event, context) => {
	const query = event.queryStringParameters.query;

	const results = index.search(query, {
		limit: 10,
		// threshold: 5,
		// depth: 3,
	});

	return {
		statusCode: 200,
		body: JSON.stringify(results),
	};
};
