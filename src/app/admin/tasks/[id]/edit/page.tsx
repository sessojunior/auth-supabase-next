// Página src/app/tasks/[id]/edit/page.tsx permite ao usuário atualizar uma tarefa existente.
// Essa página permite a edição de uma tarefa existente, populando os campos com os dados atuais da tarefa.

import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/client"
import { useForm } from "react-hook-form"

// Tipo explícito para a tarefa
type Task = {
	title: string
	description: string
}

export default function EditTaskPage() {
	const router = useRouter()
	const { id } = router.query
	const { register, handleSubmit, setValue } = useForm<Task>()
	const [loading, setLoading] = useState(true)
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	useEffect(() => {
		// Verificação de sessão
		const checkAuth = async () => {
			const { data: sessionData } = await supabase.auth.getSession()
			if (!sessionData?.session) {
				router.push("/login") // Redireciona para a página de login se não estiver autenticado
			} else {
				setIsAuthenticated(true)
			}
		}
		checkAuth()
	}, [router])

	useEffect(() => {
		const fetchTask = async () => {
			const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single()

			if (error) {
				console.error("Erro ao buscar tarefa:", error.message)
				return
			}

			if (data) {
				setValue("title", data.title)
				setValue("description", data.description)
			}
			setLoading(false)
		}

		if (id && isAuthenticated) fetchTask()
	}, [id, isAuthenticated, setValue])

	const onSubmit = async (data: Task) => {
		const { title, description } = data
		const { error } = await supabase.from("tasks").update({ title, description }).eq("id", id)

		if (error) {
			console.error("Erro ao atualizar tarefa:", error.message)
			return
		}

		router.push(`/tasks/${id}`)
	}

	if (loading) return <div>Carregando...</div>

	return (
		<div className='max-w-2xl mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>Editar Tarefa</h1>
			<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
				<div>
					<label className='block text-sm font-medium'>Título</label>
					<input {...register("title")} className='mt-1 block w-full p-2 border border-gray-300 rounded-md' />
				</div>
				<div>
					<label className='block text-sm font-medium'>Descrição</label>
					<textarea {...register("description")} className='mt-1 block w-full p-2 border border-gray-300 rounded-md' />
				</div>
				<button type='submit' className='bg-indigo-600 text-white py-2 px-4 rounded-md'>
					Salvar Alterações
				</button>
			</form>
		</div>
	)
}
