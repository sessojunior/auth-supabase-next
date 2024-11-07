// Middleware Global na Raiz do Projeto
// src/middleware.ts

// Este middleware global aplica a lógica de proteção de rotas em todo o aplicativo,
// garantindo que apenas usuários autenticados possam acessar certas rotas.

import { type NextRequest } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

export async function middleware(request: NextRequest) {
	return await updateSession(request)
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
		"/admin/:path*", // Protege todas as rotas dentro de "/admin" e subdiretórios
	],
}
