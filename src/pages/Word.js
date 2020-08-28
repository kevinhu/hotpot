import React from "react";

const Word = () => {
	const sectionHeaderStyle = "text-xl text-gray-800";

	return (
		<div className="w-full">
			<div className="w-full text-center py-12">
				<div className="chinese-serif flex justify-center">
					<div className="px-2">
						<div className="text-2xl red font-bold">huǒ</div>
						<div style={{ fontSize: "6rem", lineHeight: "6rem" }}>
							火
						</div>
					</div>
					<div className="px-2">
						<div className="text-2xl red font-bold">guō</div>
						<div style={{ fontSize: "6rem", lineHeight: "6rem" }}>
							锅
						</div>
					</div>
				</div>
			</div>
			<div
				className="w-2/3 flex english-serif mx-auto mb-12"
				style={{
					border: "solid 2px black",
				}}
			>
				<div
					className="w-2/3"
					style={{ borderRight: "solid 2px rgba(0,0,0,0.2)" }}
				>
					<div
						className="p-8"
						style={{
							borderBottom: "solid 2px rgba(0,0,0,0.2)",
						}}
					>
						<div className={sectionHeaderStyle}>Definition</div>
						<div>1. hotpot</div>
					</div>
					<div
						className="p-8"
						style={{
							borderBottom: "solid 2px rgba(0,0,0,0.2)",
						}}
					>
						<div className={sectionHeaderStyle}>Components</div>
					</div>
					<div className="p-8 text-xl text-gray-800">
						<div>Examples</div>
					</div>
				</div>
				<div className="w-1/3">
					<div
						className="p-8"
						style={{
							borderBottom: "solid 2px rgba(0,0,0,0.2)",
						}}
					>
						<div className={sectionHeaderStyle}>Words</div>
						<div className="chinese-serif">
							<div className="inline">纸</div>
							<div className="red inline">火锅</div>
						</div>
						<div className="chinese-serif">
							<div className="inline">盖</div>
							<div className="red inline">火锅</div>
						</div>
						<div className="chinese-serif">
							<div className="inline">奶酪</div>
							<div className="red inline">火锅</div>
						</div>
						<div className="chinese-serif">
							<div className="inline">石头</div>
							<div className="red inline">火锅</div>
						</div>
					</div>
					<div className="p-8 text-xl text-gray-800">
						<div className={sectionHeaderStyle}>Statistics</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Word;
