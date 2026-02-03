// tailwind.config.js
const { heroui } = require("@heroui/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		// ...
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				text: {
					secondary: "var(--text-secondary)",
					muted: "var(--text-muted)",
				},
				surface: {
					glass: "var(--surface-glass)",
				},
				border: {
					glass: "var(--border-glass)",
				},
			},
		},
	},
	darkMode: "class",
	plugins: [heroui()],
};
