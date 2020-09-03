import React from "react";

import Styles from "./Loading.module.css";

function Loading() {
	return (
		<div>
			<svg
				viewBox="0 0 600 300"
				className="loading-svg text-4xl text-black stroke-current dark:text-white"
			>
				<text
					className={Styles.loading_text}
					text-anchor="middle"
					x="50%"
					y="50%"
					dy=".35em"
				>
					正在加载...
				</text>
				<text
					className={Styles.loading_text}
					text-anchor="middle"
					x="50%"
					y="50%"
					dy=".35em"
				>
					正在加载...
				</text>
			</svg>
		</div>
	);
}

export default Loading;
