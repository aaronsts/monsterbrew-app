import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import "@fontsource/yatra-one";
import MainNavigation from "@/components/main-navigation";
import { ReactQueryClientProvider } from "@/components/providers/ReactQueryClientProvider";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata: Metadata = {
	title: "Monsterbrew | Homebrewing creatures with ease",
	description:
		"Create custom 5e Dungeons & Dragons creatures effortlessly with an intuitive D&D homebrew tool!",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ReactQueryClientProvider>
			<html lang="en">
				<body
					className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
				>
					<MainNavigation />
					{children}
				</body>
			</html>
		</ReactQueryClientProvider>
	);
}
