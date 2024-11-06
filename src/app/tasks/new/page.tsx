// Página src/app/tasks/new/page.tsx permite ao usuário criar uma nova tarefa, preenchendo os campos de título e descrição.
// Essa página contém um formulário com React Hook Form, onde o usuário insere o título e a descrição da tarefa.

import { useForm } from "react-hook-form"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

// Definindo o tipo para a nova tarefa
type NewTaskData = {
	title: string
	description?: string
}

export default function NewTaskPage() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<NewTaskData>()
	const router = useRouter()
	const [isAuthenticated, setIsAuthenticated] = useState(false)

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

	const onSubmit = async (data: NewTaskData) => {
		const { title, description } = data
		const { data: userData } = await supabase.auth.getUser()

		if (!userData?.user) {
			console.error("Usuário não autenticado")
			return
		}

		const { error } = await supabase.from("tasks").insert([{ title, description, user_id: userData.user.id }])

		if (error) {
			console.error("Erro ao criar tarefa:", error.message)
			return
		}

		router.push("/tasks")
	}

	if (!isAuthenticated) return <div>Carregando...</div>

	return (
		<div className='max-w-2xl mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>Nova Tarefa</h1>
			<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
				<div>
					<label className='block text-sm font-medium'>Título</label>
					<input {...register("title", { required: "Título é obrigatório" })} className='mt-1 block w-full p-2 border border-gray-300 rounded-md' />
					{errors.title && <p className='text-red-500 text-sm'>{errors.title.message}</p>}
				</div>
				<div>
					<label className='block text-sm font-medium'>Descrição</label>
					<textarea {...register("description")} className='mt-1 block w-full p-2 border border-gray-300 rounded-md' />
				</div>
				<button type='submit' className='bg-indigo-600 text-white py-2 px-4 rounded-md'>
					Criar Tarefa
				</button>
			</form>
		</div>
	)
}
