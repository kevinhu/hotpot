import React, { useState } from "react";
import { useHistory, Link } from 'react-router-dom';
const Navbar = () => {

	let history = useHistory();
	const linkHover = `hover:text-blue-600 dark-hover:text-orange-500`;

	var [searchWord, setSearchWord] = useState("");

	const handleSubmit = (event) => {
		event.preventDefault();
		history.push(`/word?word=${searchWord}`);
	};

	const handleChange = (event) => {

		setSearchWord(event.target.value);
	};

	return (
		<div
			className="w-3/4 flex mx-auto bg-white"
			style={{
				borderBottom: "solid 2px black",
				borderLeft: "solid 2px black",
				borderRight: "solid 2px black",
			}}
		>
			<Link
				to="/"
				className="english-serif px-6 py-2 red text-2xl"
				style={{ borderRight: "solid 2px black" }}
			>
				huoguo
			</Link>
			<form
				onSubmit={handleSubmit}
				className="chinese-serif px-6 bg-transparent outline-none w-full"
			>
				<input
				className="chinese-serif px-6 bg-transparent outline-none w-full"
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
