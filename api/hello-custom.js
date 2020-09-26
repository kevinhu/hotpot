const SearchData = require("./search_data.json");
const fuzzysort = require("fuzzysort");

exports.handler = async (event, context) => {
	const query = event.queryStringParameters.query;

	let fuzzyResults = fuzzysort.go(query, SearchData, {
		keys: [
			"toneless_pinyin",
			"short_definition",
			"simplified",
			"traditional",
			"pinyin",
		],
		allowTypo: false,
		limit: 8,
		threshold: -100,
	});
	fuzzyResults = fuzzyResults.sort((a, b) =>
		a.obj.rank >= b.obj.rank ? 1 : -1
	);

	return {
		statusCode: 200,
		body: JSON.stringify(fuzzyResults),
	};
};
