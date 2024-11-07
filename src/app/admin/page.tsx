// Página Protegida: Página inicial da administração
// src/app/admin/page.tsx

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import LogoutButton from "@/components/button-logout"

export default async function AdminPage() {
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
				<h1 className='text-2xl font-bold'>Administração</h1>
				<LogoutButton />
			</div>
			<h1>Bem-vindo, {user.email}</h1>
			<p>Esta é sua página da administração.</p>
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
