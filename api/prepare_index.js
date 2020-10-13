var fs = require("fs");

const SearchData = require("./search_data.json");

const { index } = require("./flexsearch/settings.js");

index.add(SearchData);

fs.writeFile("index.json", index.export({ serialize: true }), function (err) {
	if (err) return console.log(err);
});
