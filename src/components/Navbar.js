import React from "react";

const Navbar = () => {
	const linkHover = `hover:text-blue-600 dark-hover:text-orange-500`;

	return (
		<div
			className="w-3/4 flex mx-auto bg-white"
			style={{
				borderBottom: "solid 2px black",
				borderLeft: "solid 2px black",
				borderRight: "solid 2px black",
			}}
		>
			<div
				className="english-serif px-6 py-2 red text-2xl"
				style={{ borderRight: "solid 2px black" }}
			>
				huoguo
			</div>
			<input
				className="chinese-serif px-6 bg-transparent outline-none w-full"
				type="text"
				placeholder="Search 189,432 words"
			></input>
		</div>
	);
};

export default Navbar;
