import React, { useState, useEffect } from "react";

import PinyinCharacter from "../components/PinyinCharacter.js";

import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";

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
		if (wordParam != word && !loading) {
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

	if (!wordData) {
		if (!loading) {
			return <div>word not found</div>;
		} else {
			return <div>loading...</div>;
		}
	}

	return (
		<div className="w-full">
			<div className="w-full text-center py-16">
				<div className="chinese-serif flex justify-center">
					<PinyinCharacter
						character="火"
						pinyin="huǒ"
						characterSize="6rem"
						pinyinSize="2rem"
						className="px-2"
					/>
					<PinyinCharacter
						character="锅"
						pinyin="guō"
						characterSize="6rem"
						pinyinSize="2rem"
						className="px-2"
					/>
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
						<div className="flex items-center">
							<div className="chinese-serif text-4xl pr-4 py-4">
								火
							</div>
							<div>
								<div className="text-xl font-semibold">huǒ</div>
								<div className="text-gray-600">
									fire/urgent/ammunition/fiery or
									flaming/internal heat (Chinese medicine)...
								</div>
							</div>
						</div>
						<div className="flex items-center">
							<div className="chinese-serif text-4xl pr-4">
								锅
							</div>
							<div>
								<div className="text-xl font-semibold">guō</div>
								<div className="text-gray-600">
									pot/pan/boiler/CL:口[kou3],隻|只[zhi1]
								</div>
							</div>
						</div>
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
						<div className="pt-2">
							<div className="chinese-serif text-xl flex">
								<PinyinCharacter
									character="纸"
									pinyin="zhǐ"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
								/>
								<PinyinCharacter
									character="火"
									pinyin="huǒ"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
									pinyinClass="red"
									characterClass="red"
								/>
								<PinyinCharacter
									character="锅"
									pinyin="guō"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
									pinyinClass="red"
									characterClass="red"
								/>
							</div>
							<div className="text-gray-700">
								paper hot pot (hot pot using a single-use pot
								made of Japanese washi paper...
							</div>
						</div>

						<div className="pt-2">
							<div className="chinese-serif text-xl flex">
								<PinyinCharacter
									character="盖"
									pinyin="gài"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
								/>
								<PinyinCharacter
									character="火"
									pinyin="huǒ"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
									pinyinClass="red"
									characterClass="red"
								/>
								<PinyinCharacter
									character="锅"
									pinyin="guō"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
									pinyinClass="red"
									characterClass="red"
								/>
							</div>
							<div className="text-gray-700">
								to block a shot (basketball)
							</div>
						</div>

						<div className="pt-2">
							<div className="chinese-serif text-xl flex">
								<PinyinCharacter
									character="奶"
									pinyin="gài"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
								/>
								<PinyinCharacter
									character="酪"
									pinyin="lào"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
								/>
								<PinyinCharacter
									character="火"
									pinyin="huǒ"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
									pinyinClass="red"
									characterClass="red"
								/>
								<PinyinCharacter
									character="锅"
									pinyin="guō"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
									pinyinClass="red"
									characterClass="red"
								/>
							</div>
							<div className="text-gray-700">fondue</div>
						</div>

						<div className="pt-2">
							<div className="chinese-serif text-xl flex">
								<PinyinCharacter
									character="石"
									pinyin="shí"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
								/>
								<PinyinCharacter
									character="头"
									pinyin="tou"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
								/>
								<PinyinCharacter
									character="火"
									pinyin="huǒ"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
									pinyinClass="red"
									characterClass="red"
								/>
								<PinyinCharacter
									character="锅"
									pinyin="guō"
									characterSize="1.5rem"
									pinyinSize="0.75rem"
									pinyinClass="red"
									characterClass="red"
								/>
							</div>
							<div className="text-gray-700">
								claypot (used in cooking)
							</div>
						</div>
					</div>
					<div className="p-6">
						<div className={sectionHeaderStyle}>Statistics</div>
						<div>
							<div className="font-bold inline">
								1613<sup>th</sup>
							</div>{" "}
							most frequent word
						</div>
						<div>
							<div className="font-bold inline">0.00039%</div> of
							all words
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Word;
