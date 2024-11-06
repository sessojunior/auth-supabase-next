// Página src/app/register/page.tsx com o formulário de cadastro, utilizando React Hook Form e Zod para validação.

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/lib/supabase/client"

// Esquema de validação com Zod
const registerSchema = z
	.object({
		fullName: z.string().min(2, "Nome completo é obrigatório"),
		email: z.string().email("E-mail inválido"),
		password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
		confirmPassword: z.string(),
		gender: z.enum(["Masculino", "Feminino"], { message: "Selecione o gênero" }),
		birthDate: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas devem ser iguais",
		path: ["confirmPassword"],
	})

// Tipo dos dados do formulário
type RegisterData = z.infer<typeof registerSchema>

export default function RegisterPage() {
	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<RegisterData>({
		resolver: zodResolver(registerSchema),
	})

	const onSubmit = async (data: RegisterData) => {
		const { fullName, email, password, gender, birthDate } = data

		// Verificação de e-mail já cadastrado
		const { data: existingUser, error: emailCheckError } = await supabase.from("users").select("email").eq("email", email).single()

		if (emailCheckError) {
			console.error("Erro ao verificar e-mail:", emailCheckError.message)
			return
		}

		if (existingUser) {
			setError("email", { type: "manual", message: "Este e-mail já está em uso" })
			return
		}

		// Se o e-mail não estiver em uso, realiza o cadastro
		const { error } = await supabase.auth.signUp({
			email,
			password,
		})

		if (error) {
			console.error("Erro ao registrar:", error.message)
			return
		}

		// Insere os dados adicionais na tabela de usuários
		await supabase.from("users").insert([{ full_name: fullName, gender, birth_date: birthDate }])

		alert("Cadastro realizado com sucesso!")
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='max-w-sm mx-auto p-4'>
			{/* Campo de Nome Completo */}
			<div className='mb-4'>
				<label htmlFor='fullName' className='block text-sm font-medium text-gray-700'>
					Nome Completo
				</label>
				<input id='fullName' type='text' {...register("fullName")} className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Digite seu nome completo' />
				{errors.fullName && <p className='text-red-500 text-sm mt-1'>{errors.fullName.message}</p>}
			</div>

			{/* Campo de E-mail */}
			<div className='mb-4'>
				<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
					E-mail
				</label>
				<input id='email' type='email' {...register("email")} className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Digite seu e-mail' />
				{errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
			</div>

			{/* Campo de Senha */}
			<div className='mb-4'>
				<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
					Senha
				</label>
				<input id='password' type='password' {...register("password")} className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Digite sua senha' />
				{errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
			</div>

			{/* Campo de Confirmação de Senha */}
			<div className='mb-4'>
				<label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700'>
					Confirmar Senha
				</label>
				<input id='confirmPassword' type='password' {...register("confirmPassword")} className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Confirme sua senha' />
				{errors.confirmPassword && <p className='text-red-500 text-sm mt-1'>{errors.confirmPassword.message}</p>}
			</div>

			{/* Campo de Gênero */}
			<div className='mb-4'>
				<label htmlFor='gender' className='block text-sm font-medium text-gray-700'>
					Gênero
				</label>
				<select id='gender' {...register("gender")} className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'>
					<option value=''>Selecione o gênero</option>
					<option value='Masculino'>Masculino</option>
					<option value='Feminino'>Feminino</option>
				</select>
				{errors.gender && <p className='text-red-500 text-sm mt-1'>{errors.gender.message}</p>}
			</div>

			{/* Campo de Data de Nascimento */}
			<div className='mb-4'>
				<label htmlFor='birthDate' className='block text-sm font-medium text-gray-700'>
					Data de Nascimento
				</label>
				<input id='birthDate' type='date' {...register("birthDate")} className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' />
				{errors.birthDate && <p className='text-red-500 text-sm mt-1'>{errors.birthDate.message}</p>}
			</div>

			{/* Botão de Enviar */}
			<div className='mb-4'>
				<button type='submit' className='w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition'>
					Cadastrar
				</button>
			</div>
		</form>
	)
}
