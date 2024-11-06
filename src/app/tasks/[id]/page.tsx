// Página src/app/tasks/[id]/page.tsx exibe os detalhes de uma tarefa específica.
// Essa página usa o id da URL para buscar e exibir os detalhes de uma tarefa. Inclui um botão para navegar até a página de edição.
// Para excluir uma tarefa, tem um botão de exclusão na página de detalhes src/app/tasks/[id]/page.tsx. Esse botão exclui a tarefa do Supabase e redireciona o usuário de volta para a lista de tarefas.

// Página src/app/tasks/[id]/page.tsx

import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

// Definindo o tipo para uma tarefa
type Task = {
	id: string
	title: string
	description: string
	created_at: string
}

export default function TaskDetailPage() {
	const router = useRouter()
	const { id } = router.query
	const [task, setTask] = useState<Task | null>(null)

	useEffect(() => {
		const fetchTask = async () => {
			const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single()

			if (error) {
				console.error("Erro ao buscar tarefa:", error.message)
				return
			}

			setTask(data as Task) // Usando o tipo Task para garantir a tipagem correta
		}

		if (id) fetchTask()
	}, [id])

	if (!task) return <div>Carregando...</div>

	return (
		<div className='max-w-2xl mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>{task.title}</h1>
			<p>{task.description}</p>
			<button onClick={() => router.push(`/tasks/${id}/edit`)} className='bg-blue-500 text-white py-2 px-4 rounded-md mt-4'>
				Editar
			</button>
			<button
				onClick={async () => {
					const { error } = await supabase.from("tasks").delete().eq("id", id)
					if (!error) router.push("/tasks")
				}}
				className='bg-red-500 text-white py-2 px-4 rounded-md mt-4'
			>
				Excluir
			</button>
		</div>
	)
}
