import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";

import { pinyinify, numberWithCommas } from "../utilities";

import queryString from "query-string";

// Import dark mode
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

import _ from "lodash";

const Home = () => {
	const [theme, toggleTheme, componentMounted] = useDarkMode();
	let history = useHistory();
	let location = useLocation();

	let [searchWord, setSearchWord] = useState("");
	let [results, setResults] = useState([]);
	let [searchFocused, setSearchFocused] = useState(false);

	let queryParams = queryString.parse(location.search);
	let modeParam = queryParams["mode"];

	if (modeParam !== "simplified" && modeParam !== "traditional") {
		modeParam = "simplified";
		history.push(`/?mode=${modeParam}`);
	}

	const handleSubmit = (event) => {
		event.preventDefault();
		history.push(`/word/${searchWord}`);
	};

	const executeSearch = useRef(
		_.debounce((query) => {
			// if query is just whitespace
			if (!query.replace(/\s/g, "").length) {
				setResults([]);
				return;
			}
			fetch(
				`https://huoguo-search.kevinhu.io/.netlify/functions/search?query=${query}&mode=${modeParam}&limit=8`
			)
				.then((response) => {
					return response.json();
				})
				.then((body) => {
					setResults(body);
				});
		}, 160)
	).current;

	const handleChange = (event) => {
		event.persist();
		setSearchWord(event.target.value);

		executeSearch(event.target.value);
	};

	// search box style
	const searchBoxSizing =
		"w-full md:w-2/3 xl:w-1/2 absolute mx-auto text-center py-12";
	const searchBoxAesthetics = "border-2 bg-white dark:bg-gray-800";
	const searchBoxStyle = `${searchBoxSizing} ${searchBoxAesthetics} ${borderPrimaryColor}`;

	useEffect(() => {
		// ping the search endpoint to warm it up
		fetch(`https://huoguo-search.kevinhu.io/.netlify/functions/search`);
		// add when mounted
		document.addEventListener("mousedown", handleClick);
		// return function to be called when unmounted
		return () => {
			document.removeEventListener("mousedown", handleClick);
		};
	}, []);

	// handlers for detecting clicks outside of search input and suggestions
	// see https://medium.com/@pitipatdop/little-neat-trick-to-capture-click-outside-with-react-hook-ba77c37c7e82
	const searchContainer = useRef();

	const handleClick = (e) => {
		if (searchContainer.current.contains(e.target)) {
			// inside click
			return;
		}
		// outside click
		setSearchFocused(false);
	};

	const toggleMode = () => {
		queryParams["mode"] =
			queryParams["mode"] === "simplified" ? "traditional" : "simplified";

		history.push(`/?mode=${queryParams["mode"]}`);
	};

	return (
		<div>
			<div
				onClick={toggleTheme}
				checked={theme === "dark"}
				className="chinese-serif py-2 text-2xl px-4 mx-auto cursor-pointer select-none border-2 border-black bg-white dark:border-2 dark:border-gray-700 dark:bg-gray-800"
				style={{ width: "max-content", marginTop: "-2px" }}
			>
				{theme === "dark" ? "暗" : "光"}
			</div>
			<div
				className={searchBoxStyle}
				style={{
					top: "40%",
					left: "50%",
					transform: "translate(-50%, -50%)",
				}}
			>
				<div
					className="english-serif red font-semibold"
					style={{ fontSize: "4rem", lineHeight: "4rem" }}
				>
					huoguo
				</div>
				<div className="english-serif text-xl text-gray-600 pt-4 pb-8">
					A modern Chinese-English dictionary
				</div>
				<div>
					<form
						onSubmit={handleSubmit}
						className="chinese-serif px-12 bg-transparent outline-none w-full"
					>
						<div className="w-full relative" ref={searchContainer}>
							<div className="flex">
								<div
									onClick={toggleMode}
									className={`select-none cursor-pointer text-white dark:text-gray-300 border-solid border-2 text-xl chinese-serif p-2 flex-none bg ${backgroundSecondaryColor} ${borderSecondaryColor}`}
								>
									{modeParam === "simplified"
										? "简体"
										: "繁体"}
								</div>
								<input
									className={`text-lg chinese-serif p-2 outline-none w-full bg-transparent border-solid border-2 ${borderSecondaryColor}`}
									type="text"
									placeholder={`Search ${numberWithCommas(
										118639
									)} words`}
									value={searchWord}
									onChange={handleChange}
									onFocus={() => setSearchFocused(true)}
									onClick={() => {}}
								></input>
							</div>
							{results.length > 0 &&
								searchWord !== "" &&
								searchFocused && (
									<div
										className={`z-10 absolute text-left bg-white dark:bg-gray-800 border-2 border-black w-full ${borderSecondaryColor}`}
										style={{ marginTop: "-2px" }}
									>
										{results.map((result, index) => {
											return (
												<Link
													to={`/word/${result["simplified"]}`}
													className={linkHover}
													key={index}
												>
													<div className="p-2 border-b-2 border-gray-300 dark:border-gray-700">
														<div className="font-semibold">
															<div className="text-xl inline">
																{modeParam ==
																"simplified"
																	? result[
																			"simplified"
																	  ]
																	: result[
																			"traditional"
																	  ]}
															</div>
															<div className="pl-2 inline text-gray-700 dark:text-gray-300">
																{pinyinify(
																	result[
																		"pinyin"
																	]
																)}
															</div>
														</div>
														<div className="text-gray-700 dark:text-gray-300">
															{
																result[
																	"definition"
																]
															}
														</div>
													</div>
												</Link>
											);
										})}
									</div>
								)}
						</div>
					</form>
				</div>
			</div>

			<div
				className="text-center w-full absolute bottom-0 text-gray-800 dark:text-gray-200"
				style={{ zIndex: -1 }}
			>
				Made by{" "}
				<a
					className={`underline ${linkHover}`}
					href="https://kevinhu.io"
					target="_blank"
					rel="noopener noreferrer"
				>
					Kevin Hu
				</a>
				<br />
				<a
					className={`underline ${linkHover}`}
					href="https://github.com/kevinhu/huoguo"
					target="_blank"
					rel="noopener noreferrer"
				>
					Source
				</a>{" "}
				on GitHub
			</div>
		</div>
	);
};

export default Home;
