import React from "react";

const Home = () => {
	// general link hover style
	const linkHover = `hover:text-blue-600 dark-hover:text-orange-500`;
	return (
		<div>
			<div
				className="w-1/3 absolute mx-auto text-center border-solid border-2 border-black p-12"
				style={{
					top: "40%",
					left: "50%",
					transform: "translate(-50%, -50%)",
				}}
			>
				<div
					className="english-serif red font-semibold"
					style={{ fontSize: "4rem", lineHeight: "4rem" }}
				>
					huoguo
				</div>
				<div className="english-serif text-xl text-gray-600 pt-4 pb-8">
					A modern Chinese-English dictionary
				</div>
				<div>
					<input
						className="text-lg chinese-serif p-2 bg-transparent outline-none w-full mx-auto border-solid border-2 border-black"
						type="text"
						placeholder="Search 189,432 words"
					></input>
				</div>
			</div>

			<div className="text-center w-full absolute bottom-0 text-gray-800 dark:text-gray-200">
				Made by{" "}
				<a
					className={`underline ${linkHover}`}
					href="https://kevinhu.io"
					target="_blank"
					rel="noopener noreferrer"
				>
					Kevin Hu
				</a>
				<br />
				<a
					className={`underline ${linkHover}`}
					href="https://github.com/kevinhu/huoguo"
					target="_blank"
					rel="noopener noreferrer"
				>
					Source
				</a>{" "}
				on GitHub
			</div>
		</div>
	);
};

export default Home;
