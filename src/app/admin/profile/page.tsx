// Página Protegida: Perfil do usuário
// src/app/admin/profile/page.tsx

// Este é um exemplo de página que estará acessível apenas se o usuário tiver feito login.
// A sessão do usuário é verificada no lado do servidor.

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import LogoutButton from "@/components/button-logout"
import Link from "next/link"

export default async function ProfilePage() {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect("/login")
	}

	const { data: tasks, error } = await supabase.from("tasks").select("*").eq("user_id", user.id)

	if (error) {
		console.error("Erro ao buscar tarefas:", error.message)
		return <p>Erro ao carregar as tarefas.</p>
	}

	return (
		<div>
			<div className='flex p-4'>
				<h1 className='text-2xl font-bold'>Perfil do usuário</h1>
				<LogoutButton />
			</div>
			<h1>Bem-vindo, {user.email}</h1>
			<p>Esta é sua página de perfil.</p>
			<p className='mt-4'>
				<Link href='/admin/tasks' className='text-blue-500 underline'>
					Ir para a página privada de tasks
				</Link>
			</p>
		</div>
	)
}
