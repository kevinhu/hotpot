import React, { useState, useEffect } from "react";

// location management
import { useHistory, useLocation, Link } from "react-router-dom";
import queryString from "query-string";

// themes and components
import Footer from "../components/Footer";
import { linkHover, linkHoverScale } from "../themes";

// other utilities
import { pinyinify } from "../utilities";

const Results = () => {
	// enable location and history
	let history = useHistory();
	let location = useLocation();

	let [loading, setLoading] = useState(false); // whether results are loading
	let [results, setResults] = useState([]); // store search results
	let [searchWord, setSearchWord] = useState(""); // search query

	// parse search parameters and get mode and query
	let queryParams = queryString.parse(location.search);
	let modeParam = queryParams["mode"];
	let searchParam = queryParams["search"];

	// update the query state if different
	if (searchParam !== searchWord) {
		setSearchWord(searchParam);
	}

	// resolve other modes
	if (modeParam !== "simplified" && modeParam !== "traditional") {
		modeParam = "simplified";
		history.push(`/?mode=${modeParam}`);
	}

	// initial calls
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
		<div>
			{/* Results container */}
			<div className="w-full md:w-3/4 mx-auto mb-8 english-serif">
				{/* Report result count */}
				<div className="text-2xl mt-12 mb-2 ml-6">
					{results.length} results for "{searchParam}"
				</div>
				{/* Render results */}
				{results.length > 0 && searchParam !== "" && (
					<div
						className={`shadow-lg z-10 text-left bg-white dark:bg-dark-500 border-2 w-full border-black dark:border-gray-200 p-2`}
						style={{ marginTop: "-2px" }}
					>
						{results.map((result, index) => {
							return (
								<Link
									to={`/word/${encodeURI(
										result[modeParam]
									)}?mode=${modeParam}`}
									className={`${linkHover} ${linkHoverScale} block bg-white dark:bg-dark-500 dark-hover:bg-dark-800`}
									key={index}
								>
									<div className={`px-4 pt-3 pb-2 leading-6`}>
										<div className="font-semibold">
											{/* Result character */}
											<div className="text-2xl inline chinese-serif">
												{result[modeParam]}
											</div>
											{/* Pinyin */}
											<div className="pl-2 text-xl inline">
												{pinyinify(result["pinyin"])}
											</div>
										</div>
										{/* Definition */}
										<div className="text-light-500 dark:text-light-700 text-lg leading-5">
											{result["definition"]}
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				)}
			</div>
			<Footer />
		</div>
	);
};

export default Results;
