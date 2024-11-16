import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		fontFamily: {
			geist: "var(--font-geist-sans)",
			mono: "var(--font-geist-mono)",
			yatra: ["Yatra One"],
		},
		extend: {
			colors: {
				aberration: "#dd83fd",
				beast: "#a98dba",
				celestial: "#f7e64a",
				construct: "#f1c67c",
				dragon: "#dd5d63",
				elemental: "#1ddcf3",
				fey: "#61f4cb",
				fiend: "#eb7648",
				giant: "#afbec1",
				humanoid: "#95b974",
				monstrosity: "#7597ec",
				ooze: "#bef0f5",
				plant: "#64bc5e",
				undead: "#c77e5d",
				other: "#efefef",
				// primary: {
				// 	DEFAULT: "hsl(45 22.2% 96.5%)",
				// 	"50": "hsl(45 22.2% 96.5%)",
				// 	"100": "hsl(45 23.1% 89.8%)",
				// 	"200": "hsl(45 23.3% 83.1%)",
				// 	"300": "hsl(42.6 22% 72.4%)",
				// 	"400": "hsl(37.3 22.6% 61%)",
				// 	"500": "hsl(35.1 22.2% 53.1%)",
				// 	"600": "hsl(31.2 21.1% 48.2%)",
				// 	"700": "hsl(28.6, 20.4%, 40.4%)",
				// 	"800": "hsl(26.3, 18.6%, 33.7%)",
				// 	"900": "hsl(25, 16.9%, 27.8%)",
				// 	"950": "hsl(25.7, 18.9%, 14.5%)",
				// },
				background: "hsl(45 23.1% 89.8%)",
				foreground: "hsl(25.7, 18.9%, 14.5%)",
				card: {
					DEFAULT: "hsl(45 22.2% 93.5%)",
					foreground: "hsl(25.7, 18.9%, 14.5%)",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(31.2 21.1% 48.2%)",
					foreground: "hsl(45 22.2% 96.5%)",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(37.3 12.6% 55%)",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				success: {
					DEFAULT: "hsl(75.6 80.4% 30.2%)",
					foreground: "hsl(var(--destructive-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(7.6 70.4% 60.2%)",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	plugins: [tailwindAnimate],
};
export default config;
