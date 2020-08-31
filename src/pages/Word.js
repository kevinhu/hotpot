import React, { useState } from "react";

import PinyinCharacter from "../components/PinyinCharacter.js";

import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";

import { Link } from "react-router-dom";

var pinyinize = require("pinyinize");

const convert_pinyin = (pinyin) => {
	if (!pinyin) {
		return "";
	}
	pinyin = pinyin.toLowerCase();
	if (pinyin.substr(-1) === "5") {
		return pinyin.substring(0, pinyin.length - 1);
	} else {
		return pinyinize(pinyin);
	}
};

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
	// initialize url params
	let history = useHistory();
	let location = useLocation();
	let params = queryString.parse(location.search);

	let wordParam = params["word"];

	const [word, setWord] = useState();
	const [wordData, setWordData] = useState();
	const [loading, setLoading] = useState(false);

	if (wordParam) {
		if (wordParam !== word && !loading) {
			setLoading(true);
			fetch(
				`https://raw.githubusercontent.com/kevinhu/dictionary-files/master/word_jsons/${wordParam}.json`
			)
				.then((response) => response.json())
				.then((data) => {
					setWord(wordParam);
					setWordData(data);
					setLoading(false);
				});
		}
	}

	const sectionHeaderStyle = "text-xl text-gray-700 font-semibold";

	if (!wordData || loading) {
		if (!loading) {
			return <div>word not found</div>;
		} else {
			return <div>loading...</div>;
		}
	}

	console.log(wordData);

	return (
		<div className="w-full">
			<div className="w-full text-center py-16">
				<div className="chinese-serif flex justify-center">
					{word.length === 1 ? (
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
			<div
				className="w-3/4 flex english-serif mx-auto mb-12 bg-white"
				style={{
					border: "solid 2px black",
				}}
			>
				<div
					className="w-2/3"
					style={{ borderRight: "solid 2px rgba(0,0,0,0.2)" }}
				>
					<div
						className="p-6"
						style={{
							borderBottom: "solid 2px rgba(0,0,0,0.2)",
						}}
					>
						<div className={sectionHeaderStyle}>Definition</div>
						<div>{wordData["definition"]}</div>
					</div>
					<div
						className="p-6"
						style={{
							borderBottom: "solid 2px rgba(0,0,0,0.2)",
						}}
					>
						<div className={sectionHeaderStyle}>Components</div>
						{word.length > 1
							? wordData["simplified_characters"].map(
									(character, index) => {
										return (
											<div className="flex items-center">
												<div className="chinese-serif text-4xl pr-4 py-4">
													{character["definition"] ? (
														<Link
															to={`/word?word=${character["simplified"]}`}
														>
															{
																character[
																	"simplified"
																]
															}
														</Link>
													) : (
														character["simplified"]
													)}
												</div>
												<div>
													<div className="text-xl font-semibold">
														{character["pinyin"] &&
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
											<div className="flex items-center">
												<div className="chinese-serif text-4xl pr-4 py-4">
													{character["definition"] ? (
														<Link
															to={`/word?word=${character["simplified"]}`}
														>
															{
																character[
																	"simplified"
																]
															}
														</Link>
													) : (
														character["simplified"]
													)}
												</div>
												<div>
													<div className="text-xl font-semibold">
														{character["pinyin"] &&
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
										);
									}
							  })}
					</div>
					<div className="p-6">
						<div className={sectionHeaderStyle}>Examples</div>
						{wordData["sentences"].map((sentence, index) => {
							let simplified = sentence["simplified"];
							let [beforeWord, afterWord] = simplified.split(
								word
							);

							return (
								<div className="pt-2">
									{beforeWord}
									{<div className="red inline">{word}</div>}
									{afterWord}
									<div className="text-gray-700">
										{sentence["english"]}
									</div>
								</div>
							);
						})}
					</div>
				</div>
				<div className="w-1/3">
					<div
						className="p-6"
						style={{
							borderBottom: "solid 2px rgba(0,0,0,0.2)",
						}}
					>
						<div className={sectionHeaderStyle}>Words</div>
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
										>
											<div className="chinese-serif text-xl flex">
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
