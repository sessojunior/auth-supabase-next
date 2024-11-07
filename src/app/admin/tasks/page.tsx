// Página Protegida: Tarefas
// src/app/admin/tasks/page.tsx

// Esta página exibe uma lista de tarefas para usuários que fizeram login.
// A sessão do usuário é verificada no lado do servidor.

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import LogoutButton from "@/components/button-logout"
import Link from "next/link"

export default async function TasksPage() {
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
				<h1 className='text-2xl font-bold'>Tarefas</h1>
				<LogoutButton />
			</div>
			{tasks && tasks.length > 0 ? (
				<ul className='list-disc pl-5 space-y-2'>
					{tasks.map((task) => (
						<li key={task.id} className='p-2 border rounded'>
							<h2 className='font-semibold'>{task.title}</h2>
							<p>{task.description}</p>
						</li>
					))}
				</ul>
			) : (
				<p>Nenhuma tarefa encontrada.</p>
			)}
			<p className='mt-4'>
				<Link href='/admin/profile' className='text-blue-500 underline'>
					Ir para a página privada de perfil do usuário
				</Link>
			</p>
		</div>
	)
}
