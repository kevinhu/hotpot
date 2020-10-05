var fs = require("fs");
var msgpack = require("msgpack-lite");

const SearchData = require("./search_data.json");

const { index } = require("./flexsearch/settings.js");

index.add(SearchData);
// index.add(SearchData.slice(0, 10000));

fs.writeFile("index.json", index.export({ serialize: true }), "utf8", function (
	err
) {
	if (err) return console.log(err);
});
