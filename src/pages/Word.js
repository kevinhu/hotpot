import React, { useEffect, useState } from "react";

import PinyinCharacter from "../components/PinyinCharacter.js";

import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";

import { Link, useParams } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";

import Loading from "../components/Loading";

import NotFound from "../assets/not_found.svg";

import {
	linkHover,
	primaryColor,
	secondaryColor,
	darkPrimaryColor,
	darkSecondaryColor,
	textPrimaryColor,
	textSecondaryColor,
	borderPrimaryColor,
	borderSecondaryColor,
} from "../themes";

import {
	pinyinify,
	removeDuplicates,
	getCharacterLength,
	splitFirst,
} from "../utilities";
const IDEOGRAPHIC_DESCRIPTIONS = [
	"⿰",
	"⿱",
	"⿲",
	"⿳",
	"⿴",
	"⿵",
	"⿶",
	"⿷",
	"⿸",
	"⿹",
	"⿺",
	"⿻",
];

const MAX_OTHER_DESCRIPTION_LENGTH = 64;

const ordinal_suffix_of = (i) => {
	var j = i % 10,
		k = i % 100;
	if (j === 1 && k !== 11) {
		return "st";
	}
	if (j === 2 && k !== 12) {
		return "nd";
	}
	if (j === 3 && k !== 13) {
		return "rd";
	}
	return "th";
};

const Word = () => {
	const [progress, setProgress] = useState(0);
	// initialize url params
	let history = useHistory();
	let location = useLocation();
	let params = useParams();
	let queryParams = queryString.parse(location.search);
	let modeParam = queryParams["mode"];
	let wordParam = params["word"];

	if (modeParam !== "simplified" && modeParam !== "traditional") {
		modeParam = "simplified";
		history.push(`/word/${wordParam}/?mode=${modeParam}`);
	}

	let otherMode;

	if (modeParam === "simplified") {
		otherMode = "traditional";
	} else {
		otherMode = "simplified";
	}

	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	const [word, setWord] = useState();
	const [wordMode, setWordMode] = useState();
	const [wordData, setWordData] = useState();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (wordParam && modeParam && !loading) {
			// if word or mode changes, and we are not currently loading
			if (wordParam !== word || modeParam !== wordMode) {
				setLoading(true);
				setProgress(0);
				fetch(
					`https://raw.githubusercontent.com/kevinhu/dictionary-files/master/${modeParam}/${wordParam}.json`
				)
					.then((response) => {
						setProgress(50);
						if (response.status === 404) {
							setProgress(100);
							setWord(wordParam);
							setWordMode(modeParam);
							setWordData(undefined);
							setLoading(false);
							return;
						}
						return response.json();
					})
					.then((data) => {
						setProgress(100);
						setWord(wordParam);
						setWordMode(modeParam);
						setWordData(data);
						setLoading(false);

						console.log(data);
					});
			}
		}
	});

	const sectionHeaderStyle = `text-xl font-semibold ${textSecondaryColor}`;

	if (!wordData) {
		if (!loading) {
			return (
				<div className="text-center w-full h-full p-12">
					<img
						alt="No repos found."
						className="py-12 w-1/2 md:w-1/3 m-auto select-none"
						src={NotFound}
					></img>
					<div className="text-lg select-none mb-6">
						Word not found.
					</div>
				</div>
			);
		} else {
			return <Loading />;
		}
	}

	const wordType = wordData["traditional"] ? "simplified" : "traditional";
	const singlePinyin =
		removeDuplicates(wordData["pinyin"].map((x) => x.toLowerCase()))
			.length === 1;

	return (
		<div className="w-full">
			<LoadingBar
				color="#f11946"
				progress={progress}
				onLoaderFinished={() => setProgress(0)}
			/>
			<div className="w-full text-center pt-16">
				<div className="chinese-serif w-3/4 mx-auto flex justify-center flex-wrap pb-8">
					{getCharacterLength(wordData["word"]) === 1 ? (
						<PinyinCharacter
							character={wordData["word"]}
							pinyin={
								singlePinyin
									? pinyinify(wordData["pinyin"][0])
									: ""
							}
							characterSize="6rem"
							pinyinSize="2rem"
							className="px-2"
						/>
					) : (
						wordData["characters"] &&
						wordData["characters"].map((character, index) => {
							return (
								<PinyinCharacter
									character={character["word"]}
									pinyin={
										singlePinyin
											? pinyinify(
													wordData["pinyin"][0].split(
														" "
													)[index]
											  )
											: ""
									}
									characterSize="6rem"
									pinyinSize="2rem"
									className="px-2"
									key={index}
								/>
							);
						})
					)}
				</div>

				<div className="mx-auto pb-2" style={{ width: "max-content" }}>
					<div
						className={`border-b ${borderSecondaryColor} english-serif ${textSecondaryColor}`}
					>
						{wordType === "simplified"
							? "Traditional"
							: "Simplified"}
					</div>
					{wordType === "simplified" &&
						removeDuplicates(wordData["traditional"]).map(
							(traditional, index) => (
								<Link
									to={`/word/${traditional}/?mode=${otherMode}`}
									className={`${linkHover} 
											}`}
									key={index}
								>
									<div
										className="inline px-2 text-2xl chinese-serif"
										key={index}
									>
										{traditional}
									</div>
								</Link>
							)
						)}
					{wordType === "traditional" &&
						removeDuplicates(wordData["simplified"]).map(
							(simplified, index) => (
								<Link
									to={`/word/${simplified}/?mode=${otherMode}`}
									className={`${linkHover} 
											}`}
									key={index}
								>
									<div
										className="inline px-2 text-2xl chinese-serif"
										key={index}
									>
										{simplified}
									</div>
								</Link>
							)
						)}
				</div>
			</div>
			<div
				className={`w-full md:w-3/4 flex flex-wrap english-serif mx-auto mb-12 bg-white border-2 dark:bg-gray-800 ${borderPrimaryColor}`}
			>
				<div
					className={`w-full md:w-2/3 border-r-2 ${borderSecondaryColor}`}
				>
					<div className={`p-6 border-b-2 ${borderSecondaryColor}`}>
						<div className={sectionHeaderStyle}>
							{wordData["definition"].length > 1
								? "Definitions"
								: "Definition"}
						</div>
						{wordData["definition"].map((definition, index) => (
							<div className="py-1 leading-5" key={index}>
								<div className="inline font-bold">
									{index + 1}.{" "}
								</div>
								<div className="inline font-semibold">
									({pinyinify(wordData["pinyin"][index])}){" "}
								</div>
								{definition.replace("/", "; ")}
							</div>
						))}
					</div>
					<div className={`p-6 border-b-2 ${borderSecondaryColor}`}>
						<div className={sectionHeaderStyle}>
							{getCharacterLength(wordData["word"]) > 1
								? "Characters"
								: "Components"}
						</div>
						{getCharacterLength(wordData["word"]) > 1
							? wordData["characters"].map((character, index) => {
									return (
										<Link
											to={`/word/${character["word"]}/?mode=${modeParam}`}
											className={`${linkHover} ${
												!character["definition"] &&
												"disabled-link"
											}`}
											key={index}
										>
											<div className="flex items-center">
												<div className="chinese-serif text-4xl pr-4 py-4">
													{character["word"]}
												</div>
												<div>
													<div className="text-xl font-semibold">
														{character["pinyin"] &&
															pinyinify(
																removeDuplicates(
																	character[
																		"pinyin"
																	].map((x) =>
																		x.toLowerCase()
																	)
																)
																	.sort()
																	.join(" / ")
															)}
													</div>
													<div
														className={`${textSecondaryColor} leading-5 break-all`}
													>
														{character[
															"definition"
														] &&
															character[
																"definition"
															].join(" | ")}
													</div>
												</div>
											</div>
										</Link>
									);
							  })
							: "decomposition_definitions" in
									wordData["components"] &&
							  wordData["components"][
									"decomposition_definitions"
							  ].map((character, index) => {
									if (
										!IDEOGRAPHIC_DESCRIPTIONS.includes(
											character["word"]
										)
									) {
										return (
											<Link
												to={`/word/${character["word"]}/?mode=${modeParam}`}
												className={`${linkHover} ${
													!character["definition"] &&
													"disabled-link"
												}`}
												key={index}
											>
												<div className="flex items-center">
													<div className="chinese-serif text-4xl pr-4 py-4">
														{character["word"]}
													</div>
													<div>
														<div className="text-xl font-semibold">
															{character[
																"pinyin"
															] &&
																pinyinify(
																	removeDuplicates(
																		character[
																			"pinyin"
																		].map(
																			(
																				x
																			) =>
																				x.toLowerCase()
																		)
																	)
																		.sort()
																		.join(
																			" / "
																		)
																)}
														</div>
														<div
															className={`${textSecondaryColor} leading-5 break-all`}
														>
															{character[
																"definition"
															] &&
																character[
																	"definition"
																].join(" | ")}
														</div>
													</div>
												</div>
											</Link>
										);
									} else {
										return "";
									}
							  })}
					</div>
					<div className="p-6">
						<div className={sectionHeaderStyle}>
							Example sentences
						</div>
						{wordData["sentences"].length === 0 &&
							"No example sentences found."}
						{wordData["sentences"].map((sentence, index) => {
							let sentenceWord = sentence["chinese"];
							let [beforeWord, afterWord] = splitFirst(
								sentenceWord,
								word,
								1
							);

							return (
								<div className="py-3" key={index}>
									<div className="chinese-serif text-xl">
										{beforeWord}
										{
											<div className="red inline">
												{word}
											</div>
										}
										{afterWord}
									</div>
									<div className="text-gray-700 dark:text-gray-500">
										{sentence["english"]}
									</div>
								</div>
							);
						})}
					</div>
				</div>
				<div className="w-full md:w-1/3">
					<div className={`p-6 border-b-2 ${borderSecondaryColor}`}>
						<div className={sectionHeaderStyle}>Statistics</div>

						{wordData["rank"] !== -1 ? (
							<div>
								<div className="font-bold inline">
									{wordData["rank"]}
									<sup>
										{ordinal_suffix_of(wordData["rank"])}
									</sup>
								</div>{" "}
								most frequent word
							</div>
						) : (
							<div>Word rank unavailable.</div>
						)}

						{wordData["fraction"] !== -1 ? (
							<div>
								<div className="font-bold inline">
									{(wordData["fraction"] * 100).toPrecision(
										2
									)}
									%
								</div>{" "}
								of all words
							</div>
						) : (
							<div>Word fraction unavailable.</div>
						)}
					</div>
					<div className={`p-6 border-b-2 ${borderSecondaryColor}`}>
						<div className={sectionHeaderStyle}>
							Containing words
						</div>
						{wordData["containing_words"].length === 0 &&
							"No containing words found."}
						{wordData["containing_words"].map(
							(contain_word, index) => {
								let wordPinyin = contain_word[
									"pinyin"
								][0].split(" ");

								let displayWord = contain_word["word"]
									.split("")
									.map((character, index) => {
										return (
											<PinyinCharacter
												character={character}
												pinyin={pinyinify(
													wordPinyin[index]
												)}
												characterSize="1.5rem"
												pinyinSize="0.75rem"
												key={index}
											/>
										);
									});

								return (
									<div className="pt-2" key={index}>
										<Link
											to={`/word/${contain_word["word"]}/?mode=${modeParam}`}
											className={linkHover}
										>
											<div className="chinese-serif text-xl flex flex-wrap">
												{displayWord}
											</div>
											<div
												className={`${textSecondaryColor}  break-all leading-5`}
											>
												{contain_word["definition"]
													.length >
												MAX_OTHER_DESCRIPTION_LENGTH
													? contain_word[
															"definition"
													  ].substring(
															0,
															MAX_OTHER_DESCRIPTION_LENGTH
													  ) + "..."
													: contain_word[
															"definition"
													  ]}
											</div>
										</Link>
									</div>
								);
							}
						)}
					</div>
					<div className="p-6">
						<div className={sectionHeaderStyle}>See also</div>
						{wordData["related"].length === 0 &&
							"No related words found."}
						{wordData["related"].map((related_word, index) => {
							let wordPinyin = related_word["pinyin"][0].split(
								" "
							);

							let displayWord = related_word["word"]
								.split("")
								.map((character, index) => {
									return (
										<PinyinCharacter
											character={character}
											pinyin={pinyinify(
												wordPinyin[index]
											)}
											characterSize="1.5rem"
											pinyinSize="0.75rem"
											key={index}
										/>
									);
								});

							return (
								<div className="pt-2" key={index}>
									<Link
										to={`/word/${related_word["word"]}/?mode=${modeParam}`}
										className={linkHover}
									>
										<div className="chinese-serif text-xl flex flex-wrap">
											{displayWord}
										</div>
										<div
											className={`${textSecondaryColor}  break-all leading-5`}
										>
											{related_word["definition"].length >
											MAX_OTHER_DESCRIPTION_LENGTH
												? related_word[
														"definition"
												  ].substring(
														0,
														MAX_OTHER_DESCRIPTION_LENGTH
												  ) + "..."
												: related_word["definition"]}
										</div>
									</Link>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Word;
