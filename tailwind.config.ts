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
          DEFAULT: "#608976",
          foreground: "hsl(45 22.2% 96.5%)",
        },
        tertiary: {
          DEFAULT: "hsl(186, 77%, 34%)",
          foreground: "hsl(45 22.2% 96.5%)",
        },
        muted: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(37.3 12.6% 55%)",
        },
        accent: {
          DEFAULT: "hsl(45 23.1% 90%)",
          foreground: "hsl(25 16.9% 27.8%)",
        },
        success: {
          DEFAULT: "hsl(75.6 80.4% 30.2%)",
          foreground: "hsl(210 40% 98%)",
        },
        destructive: {
          DEFAULT: "hsl(12, 66%, 54%)",
          foreground: "hsl(210 40% 98%)",
        },
        border: "hsl(45 23.3% 83.1%)",
        input: "hsl(45 23.3% 83.1%)",
        ring: "hsl(25.7 18.9% 14.5%)",
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
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindAnimate],
};
export default config;
