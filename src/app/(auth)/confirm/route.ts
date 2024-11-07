// Manipulador de Rota
// src/app/auth/confirm/route.ts

// Esse script tenta verificar o OTP usando supabase.auth.verifyOtp.
// Este método permite validar o token enviado para o e - mail e, ao mesmo tempo, cria uma sessão para o usuário.

// Quando o OTP é validado com sucesso, o Supabase deve gerar uma sessão ativa para o usuário,
// o que possibilita o redirecionamento direto para a página protegida(/admin ou outra definida).

// Passos Resumidos para o Login Automático
//
// 1. Recebe o Token e o Tipo de Autenticação:
//    Ao clicar no link de verificação no e - mail, o Supabase redireciona o usuário para a rota
//    com o token_hash e type nos parâmetros de URL.
// 2. Verifica o OTP: O código no manipulador de rota GET utiliza supabase.auth.verifyOtp
//    para validar o token.
// 3. Gera uma Sessão para o Usuário:
//    Se o verifyOtp for bem-sucedido, uma sessão de autenticação é criada automaticamente,
//    permitindo que o usuário acesse áreas protegidas.
// 4. Redireciona o Usuário:
//    Ao final, o redirecionamento acontece para a página protegida(/admin), com o usuário já logado.

import { type NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const code = searchParams.get("code")
	const next = "/admin" // Página de redirecionamento após a confirmação bem-sucedida

	if (code) {
		const supabase = await createClient()

		// Tenta trocar o código de verificação por uma sessão ativa
		const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

		if (error) {
			console.error("Erro ao confirmar e-mail:", error.message)
			redirect("/error") // Redireciona para uma página de erro em caso de falha
			return
		}

		// Se a sessão for criada com sucesso, redireciona o usuário para a página /admin
		if (sessionData) {
			redirect(next)
			return
		}
	}

	// Se o código for inválido ou ausente, redireciona para a página inicial
	redirect("/")
}
