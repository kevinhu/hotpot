import React, { useState, useEffect } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";

import queryString from "query-string";

import { pinyinify } from "../utilities";

import { linkHover } from "../themes";

const Results = () => {
	let history = useHistory();
	let location = useLocation();
	let [loading, setLoading] = useState(false);
	let [results, setResults] = useState([]);
	let [searchWord, setSearchWord] = useState("");

	let queryParams = queryString.parse(location.search);
	let modeParam = queryParams["mode"];
	let searchParam = queryParams["search"];

	if (searchParam !== searchWord) {
		setSearchWord(searchParam);
	}

	if (modeParam !== "simplified" && modeParam !== "traditional") {
		modeParam = "simplified";
		history.push(`/?mode=${modeParam}`);
	}

	useEffect(() => {
		setLoading(true);
		// ping the search endpoint to warm it up
		fetch(
			`https://hotpot-search.kevinhu.io/.netlify/functions/search?query=${encodeURI(
				searchWord
			)}&mode=${modeParam}&limit=64`
		)
			.then((response) => {
				return response.json();
			})
			.then((body) => {
				setResults(body);
				setLoading(false);
			});
	}, [searchWord, modeParam]);

	return (
		<div className="w-full md:w-3/4 mx-auto">
			<div className="text-2xl mt-12 mb-2 english-serif">
				{results.length} results for "{searchParam}"
			</div>
			{results.length > 0 && searchParam !== "" && (
				<div
					className={`shadow-lg z-10 text-left bg-white dark:bg-dark-500 border-2 w-full border-black dark:border-gray-200 p-4`}
					style={{ marginTop: "-2px" }}
				>
					{results.map((result, index) => {
						return (
							<Link
								to={`/word/${encodeURI(
									result["simplified"]
								)}?mode=${modeParam}`}
								className={`${linkHover} block bg-white dark:bg-dark-500 transform hover:scale-105 hover:shadow dark-hover:bg-dark-800 hover:z-20 relative`}
								key={index}
							>
								<div className={`p-2`}>
									<div className="font-semibold">
										<div className="text-2xl inline chinese-serif">
											{modeParam === "simplified"
												? result["simplified"]
												: result["traditional"]}
										</div>
										<div className="pl-2 text-xl inline text-gray-700 dark:text-gray-300 english-serif">
											{pinyinify(result["pinyin"])}
										</div>
									</div>
									<div className="text-gray-700 dark:text-gray-300 english-serif">
										{result["definition"]}
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default Results;
