// No Next.js, o controle de rotas privadas é feito utilizando um middleware para verificar se o usuário está autenticado.
// O middleware src/middleware.ts é para proteger as rotas /admin e /dashboard.
// Este middleware verifica se há uma sessão ativa do Supabase. Se não houver, ele redireciona o usuário para a página de login.

import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function middleware(req: any) {
	const {
		data: { session },
	} = await supabase.auth.getSession()

	const isAuthRoute = req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/dashboard")

	if (!session && isAuthRoute) {
		return NextResponse.redirect(new URL("/login", req.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/admin/:path*", "/dashboard/:path*"],
}
