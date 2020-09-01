import React, { useEffect, useState } from "react";

import PinyinCharacter from "../components/PinyinCharacter.js";

import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";

import { Link } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";

import Loading from "../components/Loading";

import NotFound from "../assets/not_found.svg";

import { convert_pinyin } from "../utilities";
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
	let params = queryString.parse(location.search);

	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	let wordParam = params["word"];

	const [word, setWord] = useState();
	const [wordData, setWordData] = useState();
	const [loading, setLoading] = useState(false);

	if (wordParam) {
		if (wordParam !== word && !loading) {
			setLoading(true);
			setProgress(0);
			fetch(
				`https://raw.githubusercontent.com/kevinhu/dictionary-files/master/word_jsons/${wordParam}.json`
			)
				.then((response) => {
					setProgress(50);
					if (response.status === 404) {
						setProgress(100);
						setWord(wordParam);
						setWordData(undefined);
						setLoading(false);
						return;
					}
					return response.json();
				})
				.then((data) => {
					setProgress(100);
					setWord(wordParam);
					setWordData(data);
					setLoading(false);
				});
		}
	}

	const sectionHeaderStyle = "text-xl text-gray-700 font-semibold";

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

	const linkHover = "transition duration-300 ease-in-out hover:text-red-700";

	console.log(wordData);

	return (
		<div className="w-full">
			<LoadingBar
				color="#f11946"
				progress={progress}
				onLoaderFinished={() => setProgress(0)}
			/>
			<div className="w-full text-center py-16">
				<div className="chinese-serif w-3/4 mx-auto flex justify-center flex-wrap">
					{wordData["simplified"].length === 1 ? (
						<PinyinCharacter
							character={wordData["simplified"]}
							pinyin={convert_pinyin(wordData["pinyin"])}
							characterSize="6rem"
							pinyinSize="2rem"
							className="px-2"
						/>
					) : (
						wordData["simplified_characters"].map(
							(character, index) => {
								return (
									<PinyinCharacter
										character={character["simplified"]}
										pinyin={convert_pinyin(
											character["pinyin"]
										)}
										characterSize="6rem"
										pinyinSize="2rem"
										className="px-2"
									/>
								);
							}
						)
					)}
				</div>
			</div>
			<div className="w-full md:w-3/4 flex flex-wrap english-serif mx-auto mb-12 bg-white border-solid border-2 border-black dark:border-gray-600 dark:bg-gray-800">
				<div
					className="w-full md:w-2/3"
					style={{ borderRight: "solid 2px rgba(0,0,0,0.2)" }}
				>
					<div
						className="p-6"
						style={{
							borderBottom: "solid 2px rgba(0,0,0,0.2)",
						}}
					>
						<div className={sectionHeaderStyle}>Definition</div>
						<div>{wordData["definition"].replace("/", "; ")}</div>
					</div>
					<div
						className="p-6"
						style={{
							borderBottom: "solid 2px rgba(0,0,0,0.2)",
						}}
					>
						<div className={sectionHeaderStyle}>
							{wordData["simplified"].length > 1
								? "Characters"
								: "Components"}
						</div>
						{wordData["simplified"].length > 1
							? wordData["simplified_characters"].map(
									(character, index) => {
										return (
											<Link
												to={`/word?word=${character["simplified"]}`}
												className={`${linkHover} ${
													!character["definition"] &&
													"disabled-link"
												}`}
											>
												<div className="flex items-center">
													<div className="chinese-serif text-4xl pr-4 py-4">
														{
															character[
																"simplified"
															]
														}
													</div>
													<div>
														<div className="text-xl font-semibold">
															{character[
																"pinyin"
															] &&
																convert_pinyin(
																	character[
																		"pinyin"
																	]
																)}
														</div>
														<div className="text-gray-600">
															{
																character[
																	"definition"
																]
															}
														</div>
													</div>
												</div>
											</Link>
										);
									}
							  )
							: wordData["simplified_components"][
									"decomposition_definitions"
							  ].map((character, index) => {
									if (
										!IDEOGRAPHIC_DESCRIPTIONS.includes(
											character["simplified"]
										)
									) {
										return (
											<Link
												to={`/word?word=${character["simplified"]}`}
												className={`${linkHover} ${
													!character["definition"] &&
													"disabled-link"
												}`}
											>
												<div className="flex items-center">
													<div className="chinese-serif text-4xl pr-4 py-4">
														{
															character[
																"simplified"
															]
														}
													</div>
													<div>
														<div className="text-xl font-semibold">
															{character[
																"pinyin"
															] &&
																convert_pinyin(
																	character[
																		"pinyin"
																	]
																)}
														</div>
														<div className="text-gray-600">
															{
																character[
																	"definition"
																]
															}
														</div>
													</div>
												</div>
											</Link>
										);
									}
							  })}
					</div>
					<div className="p-6">
						<div className={sectionHeaderStyle}>
							Example sentences
						</div>
						{wordData["sentences"].map((sentence, index) => {
							let simplified = sentence["simplified"];
							let [beforeWord, afterWord] = simplified.split(
								word
							);

							return (
								<div className="pt-2">
									<div className="chinese-serif text-xl">
										{beforeWord}
										{
											<div className="red inline">
												{word}
											</div>
										}
										{afterWord}
									</div>
									<div className="text-gray-700">
										{sentence["english"]}
									</div>
								</div>
							);
						})}
					</div>
				</div>
				<div className="w-full md:w-1/3">
					<div
						className="p-6"
						style={{
							borderBottom: "solid 2px rgba(0,0,0,0.2)",
						}}
					>
						<div className={sectionHeaderStyle}>
							Containing words
						</div>
						{wordData["containing_words"].map(
							(contain_word, index) => {
								let wordPinyin = contain_word["pinyin"].split(
									" "
								);

								let displayWord = contain_word["simplified"]
									.split("")
									.map((character, index) => {
										return (
											<PinyinCharacter
												character={character}
												pinyin={convert_pinyin(
													wordPinyin[index]
												)}
												characterSize="1.5rem"
												pinyinSize="0.75rem"
											/>
										);
									});

								return (
									<div className="pt-2">
										<Link
											to={`/word/?word=${contain_word["simplified"]}`}
											className={linkHover}
										>
											<div className="chinese-serif text-xl flex flex-wrap">
												{displayWord}
											</div>
										</Link>
										<div className="text-gray-700 break-words">
											{contain_word["definition"].length >
											MAX_OTHER_DESCRIPTION_LENGTH
												? contain_word[
														"definition"
												  ].substring(
														0,
														MAX_OTHER_DESCRIPTION_LENGTH
												  ) + "..."
												: contain_word["definition"]}
										</div>
									</div>
								);
							}
						)}
					</div>
					<div
						className="p-6"
						style={{
							borderBottom: "solid 2px rgba(0,0,0,0.2)",
						}}
					>
						<div className={sectionHeaderStyle}>See also</div>
						{wordData["related"].map((related_word, index) => {
							let wordPinyin = related_word["pinyin"].split(" ");

							let displayWord = related_word["simplified"]
								.split("")
								.map((character, index) => {
									return (
										<PinyinCharacter
											character={character}
											pinyin={convert_pinyin(
												wordPinyin[index]
											)}
											characterSize="1.5rem"
											pinyinSize="0.75rem"
										/>
									);
								});

							return (
								<div className="pt-2">
									<Link
										to={`/word/?word=${related_word["simplified"]}`}
										className={linkHover}
									>
										<div className="chinese-serif text-xl flex flex-wrap">
											{displayWord}
										</div>
									</Link>
									<div className="text-gray-700 break-words">
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
								</div>
							);
						})}
					</div>
					<div className="p-6">
						<div className={sectionHeaderStyle}>Statistics</div>

						{wordData["rank"] !== -1 && (
							<div>
								<div className="font-bold inline">
									{wordData["rank"]}
									<sup>
										{ordinal_suffix_of(wordData["rank"])}
									</sup>
								</div>{" "}
								most frequent word
							</div>
						)}

						{wordData["fraction"] !== -1 && (
							<div>
								<div className="font-bold inline">
									{(wordData["fraction"] * 100).toPrecision(
										2
									)}
									%
								</div>{" "}
								of all words
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Word;
