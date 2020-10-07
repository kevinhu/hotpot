const { index } = require("./flexsearch/settings.js");

index.import(require("./index.json"), { serialize: false });

const MAX_RESULTS = 64;

exports.handler = async (event, context) => {
	if (event.httpMethod != "GET") {
		return {
			statusCode: 500,
			body: "unrecognized HTTP Method, must be GET",
		};
	}

	const query = event.queryStringParameters.query;
	let limit = parseInt(event.queryStringParameters.limit);

	if (!Number.isInteger(limit) || limit > MAX_RESULTS) {
		limit = MAX_RESULTS;
	}

	let results = index.search(query, {
		limit: MAX_RESULTS,
		sort: "rank",
		// threshold: 5,
		// depth: 3,
	});

	results = results.slice(0, limit);

	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Allow-Methods": "GET",
	};

	return {
		statusCode: 200,
		headers,
		body: JSON.stringify(results),
	};
};
