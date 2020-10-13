import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";

import { pinyinify, numberWithCommas } from "../utilities";

import BarLoader from "react-spinners/BarLoader";
import { css } from "@emotion/core";

import queryString from "query-string";

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
	let [loading, setLoading] = useState(false);

	let queryParams = queryString.parse(location.search);
	let modeParam = queryParams["mode"];

	if (modeParam !== "simplified" && modeParam !== "traditional") {
		modeParam = "simplified";
		history.push(`/?mode=${modeParam}`);
	}

	const handleSubmit = (event) => {
		event.preventDefault();
		history.push(`/results?search=${searchWord}&mode=${modeParam}`);
	};

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

	const handleChange = (event) => {
		event.persist();
		setSearchWord(event.target.value);

		executeSearch(event.target.value);
	};

	// search box style
	const searchBoxSizing =
		"w-full md:w-2/3 xl:w-1/2 absolute mx-auto text-center py-12";
	const searchBoxAesthetics = "shadow-lg border-2 bg-white dark:bg-dark-700";
	const searchBoxStyle = `${searchBoxSizing} ${searchBoxAesthetics} ${borderPrimaryColor}`;

	useEffect(() => {
		// ping the search endpoint to warm it up
		fetch(`https://hotpot-search.kevinhu.io/.netlify/functions/search`);
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

	const override = css`
		width: 100%;
		height: 2px;
		display: block;
		margin-top: -2px;
		background-color: ${theme === "dark" ? "white" : "black"};
	`;

	return (
		<div>
			<div
				onClick={toggleTheme}
				checked={theme === "dark"}
				className="shadow-xl chinese-serif py-2 text-2xl px-4 mx-auto cursor-pointer select-none border-2 border-black bg-white dark:border-2 dark:border-gray-700 dark:bg-dark-700"
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
					hotpot
				</div>
				<div className="english-serif text-xl text-gray-400 pt-4 pb-8">
					A modern Chinese-English dictionary
				</div>
				<div>
					<form
						onSubmit={handleSubmit}
						className="chinese-serif px-12 bg-transparent outline-none w-full"
					>
						<div className="w-full relative" ref={searchContainer}>
							<div className="shadow-lg flex">
								<div
									onClick={toggleMode}
									className={`select-none cursor-pointer border-solid border-2 text-xl chinese-serif p-2 flex-none border-black dark:border-gray-200 bg-black text-white dark:bg-gray-200 dark:text-black`}
								>
									{modeParam === "simplified"
										? "简体"
										: "繁体"}
								</div>
								<input
									className={`text-lg chinese-serif p-2 outline-none w-full bg-transparent border-solid border-2 border-black dark:border-gray-200`}
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
							<BarLoader
								css={override}
								size={"100%"}
								color={theme === "dark" ? "#c10000" : "#e84a5f"}
								loading={loading}
							/>
							{results.length > 0 &&
								searchWord !== "" &&
								searchFocused && (
									<div
										className={`shadow-lg z-10 absolute text-left bg-white dark:bg-dark-800 border-2 border-black w-full border-black dark:border-gray-200`}
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
															index != 0 &&
															"border-t-2"
														} border-gray-300 dark:border-gray-700`}
													>
														<div className="font-semibold">
															<div className="text-xl inline chinese-serif">
																{modeParam ==
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
					href="https://github.com/kevinhu/hotpot"
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
