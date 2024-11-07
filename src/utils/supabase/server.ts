// Cliente Supabase para Componentes de Servidor
// src/utils/supabase/server.ts

// Este arquivo configura o cliente do Supabase para uso no lado do servidor.
// Ele permite que componentes do servidor verifiquem a sessão do usuário e recuperem dados autenticados.

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
	const cookieStore = await cookies()

	return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			getAll() {
				return cookieStore.getAll()
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
			},
		},
	})
}
