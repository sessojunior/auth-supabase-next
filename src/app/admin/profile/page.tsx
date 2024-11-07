// Página Protegida: Perfil do usuário
// src/app/admin/profile/page.tsx

// Este é um exemplo de página que estará acessível apenas se o usuário tiver feito login.
// A sessão do usuário é verificada no lado do servidor.

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import LogoutButton from "@/components/button-logout"
import Link from "next/link"

export default async function ProfilePage() {
	// Cria o cliente Supabase
	const supabase = await createClient()

	// Verifica a autenticação do usuário
	const {
		data: { user },
	} = await supabase.auth.getUser()

	// Redireciona para a página de login se o usuário não estiver autenticado
	if (!user) {
		redirect("/login")
	}

	return (
		<div>
			<div className='flex p-4'>
				<h1 className='text-2xl font-bold'>Perfil do usuário</h1>
				<LogoutButton />
			</div>
			<h1>Bem-vindo, {user.email}</h1>
			<p>Esta é sua página de perfil.</p>
			<p>
				<Link href='/login' className='text-blue-500 underline'>
					Ir para a página de login
				</Link>
			</p>
			<p>
				<Link href='/admin/profile' className='text-blue-500 underline'>
					Ir para a página privada de admin - profile
				</Link>
			</p>
			<p>
				<Link href='/admin/tasks' className='text-blue-500 underline'>
					Ir para a página privada de admin - tasks
				</Link>
			</p>
		</div>
	)
}
