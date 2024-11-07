// Proteção de Rotas com Supabase
// src/utils/supabase/middleware.ts

// Este arquivo usa @supabase/ssr para gerenciar a sessão do usuário e redirecionar se ele não estiver autenticado.
// redirecionar o usuário para /login apenas se ele tentar acessar uma rota em /admin sem estar autenticado.
//Todas as demais rotas, como /, /(site), e /(auth), permanecerão acessíveis sem necessidade de autenticação:

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	})

	const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			getAll() {
				return request.cookies.getAll()
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
				supabaseResponse = NextResponse.next({
					request,
				})
				cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
			},
		},
	})

	// Verificação da sessão do usuário
	const {
		data: { user },
	} = await supabase.auth.getUser()

	// Adiciona log para verificação
	// console.log("Middleware - Usuário:", user)

	// Redireciona para /login apenas se o usuário tentar acessar /admin sem estar autenticado
	if (!user && request.nextUrl.pathname.startsWith("/admin")) {
		const url = request.nextUrl.clone()
		url.pathname = "/login"
		return NextResponse.redirect(url)
	}

	return supabaseResponse
}
