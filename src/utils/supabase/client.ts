// Cliente Supabase para o Navegador
// src/utils/supabase/client.ts

// Este arquivo é usado para criar o cliente do Supabase no navegador.
// Isso é necessário para chamadas do lado do cliente, como login e registro.

import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
	return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
