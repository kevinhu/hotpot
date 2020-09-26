var FlexSearch = require("./flexsearch/flexsearch.min.js");

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
		limit: 10,
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
