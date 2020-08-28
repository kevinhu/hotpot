import React from "react";

import PinyinCharacter from "../components/PinyinCharacter.js";

const Word = () => {
	const sectionHeaderStyle = "text-xl text-gray-700 font-semibold";

	return (
		<div className="w-full">
			<div className="w-full text-center py-12">
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
				className="w-2/3 flex english-serif mx-auto mb-12"
				style={{
					border: "solid 2px black",
				}}
			>
				<div
					className="w-3/4"
					style={{ borderRight: "solid 2px rgba(0,0,0,0.2)" }}
				>
					<div
						className="p-6"
						style={{
							borderBottom: "solid 2px rgba(0,0,0,0.2)",
						}}
					>
						<div className={sectionHeaderStyle}>Definition</div>
						<div>1. hotpot</div>
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
						<div className="pt-2">
							<div className="chinese-serif text-xl">
								<div className="red font-semibold inline">
									火锅
								</div>
								里要放些什么比较好吃？
							</div>
							<div className="text-gray-700">
								What tastes good in hotpot?
							</div>
						</div>
						<div className="pt-2">
							<div className="chinese-serif text-xl">
								这儿附近有家新开的
								<div className="red font-semibold inline">
									火锅
								</div>
								店，去那儿吧。
							</div>
							<div className="text-gray-700">
								There's a new hotpot place around here, let's go
								there.
							</div>
						</div>
						<div className="pt-2">
							<div className="chinese-serif text-xl">
								冬天吃
								<div className="red font-semibold inline">
									火锅
								</div>
								太爽了。
							</div>
							<div className="text-gray-700">
								Eating hotpot during the winter is very
								invigorating.
							</div>
						</div>
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
							<div className="chinese-serif text-xl">
								<div className="inline">纸</div>
								<div className="red inline">火锅</div>
							</div>
							<div className="text-gray-700">
								paper hot pot (hot pot using a single-use pot
								made of Japanese washi paper...
							</div>
						</div>

						<div className="pt-2">
							<div className="chinese-serif text-xl">
								<div className="inline">盖</div>
								<div className="red inline">火锅</div>
							</div>
							<div className="text-gray-700">
								to block a shot (basketball)
							</div>
						</div>

						<div className="pt-2">
							<div className="chinese-serif text-xl">
								<div className="inline">奶酪</div>
								<div className="red inline">火锅</div>
							</div>
							<div className="text-gray-700">fondue</div>
						</div>

						<div className="pt-2">
							<div className="chinese-serif text-xl">
								<div className="inline">石头</div>
								<div className="red inline">火锅</div>
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
