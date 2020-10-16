import React, { useState, useEffect, useRef } from "react";

import { useHistory, useLocation, Link } from "react-router-dom";
import queryString from "query-string";

import _ from "lodash";

import { linkHover, borderPrimaryColor } from "../themes";
import { useDarkMode } from "../components/DarkMode";
import Footer from "../components/Footer";
import { useWindowDimensions } from "../components/WindowDimensionsProvider";

import BarLoader from "react-spinners/BarLoader";
import { css } from "@emotion/core";

import { pinyinify, numberWithCommas } from "../utilities";

const Home = () => {
	// dark mode functions
	const [theme, toggleTheme, componentMounted] = useDarkMode();

	// enable location and history
	let history = useHistory();
	let location = useLocation();

	// get screen dimensions
	const { width } = useWindowDimensions();
	const isMobile = width < 768;

	let [searchWord, setSearchWord] = useState(""); // current text in search box
	let [results, setResults] = useState([]); // preview search results
	let [searchFocused, setSearchFocused] = useState(false); // if search box is focused
	let [loading, setLoading] = useState(false); // if search preview is loading

	// parse search parameters and get mode
	let queryParams = queryString.parse(location.search);
	let modeParam = queryParams["mode"];

	// resolve other modes
	if (modeParam !== "simplified" && modeParam !== "traditional") {
		modeParam = "simplified";
		history.replace(`/?mode=${modeParam}`);
	}

	// search while typing handler
	const updateSearch = (event) => {
		event.persist();
		setSearchWord(event.target.value);

		executeSearch(event.target.value);
	};

	// execute search handler (debounced)
	const executeSearch = useRef(
		_.debounce((query) => {
			// if query is just whitespace
			if (!query.replace(/\s/g, "").length) {
				setResults([]);
				return;
			}
			setLoading(true);
			fetch(
				`https://hotpot-search.kevinhu.io/.netlify/functions/search?query=${query}&mode=${modeParam}&limit=8`
			)
				.then((response) => {
					return response.json();
				})
				.then((body) => {
					setResults(body);
					setLoading(false);
				});
		}, 160)
	).current;

	// handle search submit event
	const handleSubmit = (event) => {
		event.preventDefault();
		history.push(
			`/results?search=${encodeURI(searchWord)}&mode=${modeParam}`
		);
	};

	// handlers for detecting clicks outside of search input and suggestions
	// see https://medium.com/@pitipatdop/little-neat-trick-to-capture-click-outside-with-react-hook-ba77c37c7e82
	const searchContainer = useRef();

	const checkSearchFocus = (e) => {
		if (searchContainer.current.contains(e.target)) {
			// inside click
			return;
		}
		// outside click
		setSearchFocused(false);
	};

	// initial calls
	useEffect(() => {
		// ping the search endpoint to warm it up
		fetch(`https://hotpot-search.kevinhu.io/.netlify/functions/search`);
		// add when mounted
		document.addEventListener("mousedown", checkSearchFocus);
		// return function to be called when unmounted
		return () => {
			document.removeEventListener("mousedown", checkSearchFocus);
		};
	}, []);

	// switch between simplified-traditional
	const toggleMode = () => {
		queryParams["mode"] =
			queryParams["mode"] === "simplified" ? "traditional" : "simplified";

		history.push(`/?mode=${queryParams["mode"]}`);
	};

	return (
		<div>
			{/* Dark mode toggle */}
			<div
				onClick={toggleTheme}
				checked={theme === "dark"}
				className="shadow-xl chinese-serif py-2 text-2xl px-4 mx-auto cursor-pointer select-none border-2 border-black bg-white dark:border-2 dark:border-gray-700 dark:bg-dark-700"
				style={{ width: "max-content", marginTop: "-2px" }}
			>
				{theme === "dark" ? "暗" : "光"}
			</div>
			{/* Search box container */}
			<div
				className={`w-full md:w-2/3 xl:w-1/2 left-0 right-0 absolute mx-auto text-center mt-32 py-12 shadow-xl bg-white dark:bg-dark-900`}
			>
				{/* Logo */}
				<div
					className="english-serif red font-semibold pb-8"
					style={{ fontSize: "4rem", lineHeight: "4rem" }}
				>
					hotpot
				</div>
				{/* Search form container */}
				<div>
					{/* Search form */}
					<form
						onSubmit={handleSubmit}
						className={`chinese-serif outline-none w-full ${
							searchFocused && isMobile
								? "fixed block mt-0 top-0 px-0 left-0"
								: "px-4 md:px-12 "
						}`}
					>
						<div className="w-full relative" ref={searchContainer}>
							<div className="shadow-lg flex">
								{/* Simplified-traditional toggle */}
								<div
									onClick={toggleMode}
									className={`select-none cursor-pointer border-solid border-2 text-xl chinese-serif p-2 flex-none border-black dark:border-gray-200 bg-black text-white dark:bg-gray-200 dark:text-black`}
								>
									{modeParam === "simplified"
										? "简体"
										: "繁体"}
								</div>
								{/* Search input box */}
								<input
									className={`text-lg chinese-serif py-2 px-3 outline-none w-full bg-white dark:bg-dark-900 border-solid border-2 border-black dark:border-gray-200 overflow-x-hidden`}
									type="text"
									placeholder={`Search ${numberWithCommas(
										118639
									)} words`}
									value={searchWord}
									onChange={updateSearch}
									onFocus={() => setSearchFocused(true)}
									onClick={() => {}}
								></input>
							</div>
							{/* Search preview loading animation */}
							<BarLoader
								css={css`
									width: 100%;
									height: 2px;
									display: block;
									margin-top: -2px;
									background-color: ${theme === "dark"
										? "white"
										: "black"};
								`}
								size={"100%"}
								color={theme === "dark" ? "#c10000" : "#e84a5f"}
								loading={loading}
							/>
							{/* Render search results */}
							{results.length > 0 &&
								searchWord !== "" &&
								searchFocused && (
									<div
										className={`shadow-lg z-10 absolute text-left border-2 w-full border-black dark:border-gray-200`}
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
													<div
														className={`py-1 px-3`}
													>
														<div className="font-semibold">
															<div className="text-xl inline chinese-serif">
																{modeParam ===
																"simplified"
																	? result[
																			"simplified"
																	  ]
																	: result[
																			"traditional"
																	  ]}
															</div>
															<div className="pl-2 inline text-gray-700 dark:text-gray-300 english-serif">
																{pinyinify(
																	result[
																		"pinyin"
																	]
																)}
															</div>
														</div>
														<div className="text-gray-700 dark:text-gray-300 english-serif">
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
						{/* Overlay background on mobile */}
						<div
							className={`h-screen w-full bg-white dark:bg-black ${
								searchFocused && isMobile ? "block" : "hidden"
							}`}
						></div>
					</form>
				</div>
			</div>

			<Footer className="absolute" />
		</div>
	);
};

export default Home;
