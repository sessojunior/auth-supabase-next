import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
	title: "Sistema de autenticação",
	description: "Sistema de autenticação com Next.js e Supabase",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='pt-br'>
			<body>{children}</body>
		</html>
	)
}
