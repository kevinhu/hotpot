module.exports = {
	purge: [],
	theme: {
		darkSelector: ".mode-dark",
		extend: {
			colors: {
				dark: {
					100: "#393939",
					200: "#323232",
					300: "#2b2b2b",
					400: "#232323",
					500: "#1c1c1c",
					600: "#151515",
					700: "#0e0e0e",
					800: "#070707",
					900: "#000000",
				},
				light: {
					100: "#191919",
					200: "#333333",
					300: "#4C4C4C",
					400: "#656565",
					500: "#7E7E7E",
					600: "#989898",
					700: "#B1B1B1",
					800: "#CACACA",
					900: "#E3E3E3",
				},
			},
		},
	},
	variants: {
		backgroundColor: ["hover", "responsive", "focus", "dark", "dark-hover"],
		textColor: ["hover", "responsive", "focus", "dark", "dark-hover"],
		borderColor: ["hover", "responsive", "focus", "dark", "dark-hover"],
		zIndex: ["responsive", "hover", "focus"],
		placeholderColor: ["focus", "hover", "dark", "dark-hover"],
	},
	plugins: [require("tailwindcss-dark-mode")()],
};
