import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";

import queryString from "query-string";

import { pinyinify, numberWithCommas } from "../utilities";

import { useDarkMode } from "../components/DarkMode";

import {
	linkHover,
	textPrimaryColor,
	textSecondaryColor,
	borderPrimaryColor,
	borderSecondaryColor,
	backgroundPrimaryColor,
	backgroundSecondaryColor,
} from "../themes";

const Results = () => {
	const [theme, toggleTheme, componentMounted] = useDarkMode();
	let history = useHistory();
	let location = useLocation();
	let [loading, setLoading] = useState(false);
	let [results, setResults] = useState([]);

	let queryParams = queryString.parse(location.search);
	let modeParam = queryParams["mode"];
	let searchParam = queryParams["search"];

	if (modeParam !== "simplified" && modeParam !== "traditional") {
		modeParam = "simplified";
		history.push(`/?mode=${modeParam}`);
	}

	useEffect(() => {
		setLoading(true);
		// ping the search endpoint to warm it up
		fetch(
			`https://hotpot-search.kevinhu.io/.netlify/functions/search?query=${searchParam}&mode=${modeParam}&limit=64`
		)
			.then((response) => {
				return response.json();
			})
			.then((body) => {
				setResults(body);
				setLoading(false);
			});
	}, []);

	return (
		<div className="w-full md:w-3/4 mx-auto">
			<div className="text-2xl mt-12 mb-2 english-serif">
				{results.length} results for "{searchParam}"
			</div>
			{results.length > 0 && searchParam !== "" && (
				<div
					className={`shadow-lg z-10 text-left bg-white dark:bg-dark-800 border-2 border-black w-full border-black dark:border-gray-200`}
					style={{ marginTop: "-2px" }}
				>
					{results.map((result, index) => {
						return (
							<Link
								to={`/word/${result["simplified"]}?mode=${modeParam}`}
								className={linkHover}
								key={index}
							>
								<div
									className={`p-2 ${
										index != 0 && "border-t-2"
									} border-gray-300 dark:border-gray-700`}
								>
									<div className="font-semibold">
										<div className="text-xl inline chinese-serif">
											{modeParam == "simplified"
												? result["simplified"]
												: result["traditional"]}
										</div>
										<div className="pl-2 inline text-gray-700 dark:text-gray-300 english-serif">
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
