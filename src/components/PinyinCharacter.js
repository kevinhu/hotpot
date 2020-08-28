import React from "react";

const PinyinCharacter = ({
	character,
	pinyin,
	characterSize,
	pinyinSize,
	className,
}) => {
	return (
		<div className={className} style={{ width: "max-content" }}>
			<div
				className="red font-semibold english-serif text-center"
				style={{ fontSize: pinyinSize }}
			>
				{pinyin}
			</div>
			<div
				className="chinese-serif"
				style={{ fontSize: characterSize, lineHeight: characterSize }}
			>
				{character}
			</div>
		</div>
	);
};

export default PinyinCharacter;
