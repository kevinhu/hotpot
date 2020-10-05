const { index } = require("./flexsearch/settings.js");

index.import(require("./index.json"), { serialize: false });

exports.handler = async (event, context) => {
	if (event.httpMethod != "GET") {
		return {
			statusCode: 500,
			body: "unrecognized HTTP Method, must be GET",
		};
	}

	const query = event.queryStringParameters.query;

	const results = index.search(query, {
		limit: 64,
		sort: "rank",
		// threshold: 5,
		// depth: 3,
	});

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
