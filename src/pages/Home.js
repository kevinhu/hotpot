import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";

import words from "../assets/search_data.json";
import { pinyinify, numberWithCommas } from "../utilities";

// Import dark mode
import { useDarkMode } from "../components/DarkMode";

var _ = require("lodash");
const fuzzysort = require("fuzzysort");

const Home = () => {
	const [theme, toggleTheme, componentMounted] = useDarkMode();
	let history = useHistory();

	let [searchWord, setSearchWord] = useState("");
	let [results, setResults] = useState([]);

	const handleSubmit = (event) => {
		event.preventDefault();
		history.push(`/word/${searchWord}`);
	};

	const executeSearch = _.debounce((word) => {
		let fuzzyResults = fuzzysort.go(word, words, {
			keys: [
				"toneless_pinyin",
				"short_definition",
				"simplified",
				"traditional",
				"pinyin",
			],
			allowTypo: false,
			limit: 8,
			threshold: -100,
		});
		fuzzyResults = fuzzyResults.sort((a, b) =>
			a.obj.rank >= b.obj.rank ? 1 : -1
		);

		setResults(fuzzyResults);
	}, 50);

	const handleChange = (event) => {
		event.persist();
		setSearchWord(event.target.value);

		executeSearch(event.target.value);
	};

	// general link hover style
	const linkHover = "transition duration-300 ease-in-out hover:text-red-700";

	// search box style
	const searchBoxSizing =
		"w-full md:w-2/3 xl:w-1/2 absolute mx-auto text-center py-12";
	const searchBoxAesthetics = "border-2 border-black bg-white";
	const searchBoxAestheticsDark =
		"dark:border-2 dark:border-gray-700 dark:bg-gray-800";
	const searchBoxStyle = `${searchBoxSizing} ${searchBoxAesthetics} ${searchBoxAestheticsDark}`;

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
						className="chinese-serif px-6 bg-transparent outline-none w-full"
					>
						<div className="w-full relative">
							<input
								className="text-lg chinese-serif p-2 bg-transparent outline-none w-full mx-auto border-solid border-2 border-black dark:border-gray-600"
								type="text"
								placeholder={`Search ${numberWithCommas(
									words.length
								)} words`}
								value={searchWord}
								onChange={handleChange}
							></input>
							{results.length > 0 && searchWord !== "" && (
								<div
									className="absolute text-left bg-white border-solid border-2 border-black w-full dark:border-gray-600 dark:bg-gray-800"
									style={{ marginTop: "-4px" }}
								>
									{results.map((result, index) => {
										return (
											<Link
												to={`/word/${result["obj"]["simplified"]}`}
												className={linkHover}
												key={index}
											>
												<div className="flex items-center">
													<div className="p-2 text-xl font-semibold">
														{
															result["obj"][
																"simplified"
															]
														}
													</div>
													<div>
														<div className="font-semibold">
															{pinyinify(
																result["obj"][
																	"pinyin"
																]
															)}
														</div>
														<div className="text-gray-700 dark:text-gray-300">
															{
																result["obj"][
																	"short_definition"
																]
															}
														</div>
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

			<div className="text-center w-full absolute bottom-0 text-gray-800 dark:text-gray-200">
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
