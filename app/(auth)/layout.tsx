import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "../globals.css";

export const metadata: Metadata = {
	title: "Threads",
	description: "NextJS 13 Threads Application",
};

const inter = Inter({ subsets: ["latin"] });
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html lang='en'>
				<body className={`${inter.className} bg-dark-1`}>
					<div className='w-full flex justify-center items-center min-h-screen'>
						{children}
					</div>
				</body>
			</html>
		</ClerkProvider>
	);
}
