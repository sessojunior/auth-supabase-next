// Página src/app/tasks/page.tsx lista todas as tarefas criadas pelo usuário autenticado.
// Exibe uma lista de tarefas com links para cada tarefa individual. Ao clicar em uma tarefa, o usuário é levado à página de detalhes.

// Página src/app/tasks/page.tsx

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/router"

// Definindo o tipo para uma tarefa
type Task = {
	id: string
	title: string
	description: string
	created_at: string
}

export default function TaskListPage() {
	const [tasks, setTasks] = useState<Task[]>([])
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const router = useRouter()

	useEffect(() => {
		// Verificação de sessão
		const checkAuth = async () => {
			const { data: sessionData } = await supabase.auth.getSession()
			if (!sessionData?.session) {
				router.push("/login") // Redireciona para a página de login se o usuário não estiver autenticado
			} else {
				setIsAuthenticated(true)
			}
		}
		checkAuth()
	}, [router])

	useEffect(() => {
		const fetchTasks = async () => {
			const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

			if (error) {
				console.error("Erro ao buscar tarefas:", error.message)
				return
			}

			if (data) {
				setTasks(data as Task[]) // Garantimos que 'data' corresponde ao tipo 'Task[]'
			}
		}

		if (isAuthenticated) fetchTasks()
	}, [isAuthenticated])

	if (!isAuthenticated) return <div>Carregando...</div>

	return (
		<div className='max-w-2xl mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>Tarefas</h1>
			<Link href='/tasks/new'>
				<button className='bg-indigo-600 text-white py-2 px-4 rounded-md mb-4'>Nova Tarefa</button>
			</Link>
			<ul>
				{tasks.map((task) => (
					<li key={task.id} className='border-b border-gray-300 py-2'>
						<Link href={`/tasks/${task.id}`}>
							<a className='text-blue-500 hover:underline'>{task.title}</a>
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
