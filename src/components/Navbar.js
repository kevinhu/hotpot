import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
const Navbar = () => {
	let history = useHistory();

	var [searchWord, setSearchWord] = useState("");

	const handleSubmit = (event) => {
		event.preventDefault();
		history.push(`/word?word=${searchWord}`);
	};

	const handleChange = (event) => {
		setSearchWord(event.target.value);
	};
	const linkHover = `hover:red`;

	return (
		<div
			className="w-full md:w-3/4 flex mx-auto bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600"
			style={{
				marginTop: "-2px",
			}}
		>
			<Link
				to="/"
				className="english-serif px-6 py-2 red text-2xl border-r-2 border-black dark:border-gray-600"
			>
				huoguo
			</Link>
			<form
				onSubmit={handleSubmit}
				className="chinese-serif px-6 bg-transparent outline-none w-full"
			>
				<input
					className="chinese-serif bg-transparent outline-none w-full h-full"
					type="text"
					placeholder="Search 189,432 words"
					value={searchWord}
					onChange={handleChange}
				></input>
			</form>
		</div>
	);
};

export default Navbar;
