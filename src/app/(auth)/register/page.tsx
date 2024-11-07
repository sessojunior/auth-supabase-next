// Página de cadastro de usuário
// src/app/(auth)/register/page.tsx

// Esta página de cadastro no lado do cliente chama a função de autenticação do Supabase para registrar o usuário.

"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/utils/supabase/client" // Cliente configurado para o navegador
import { useState } from "react"
import { useRouter } from "next/navigation"

// Esquema de validação com Zod
const registerSchema = z.object({
	fullName: z.string().min(2, "Nome completo é obrigatório"),
	email: z.string().email("E-mail inválido"),
	password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
	gender: z.enum(["Masculino", "Feminino"], { message: "Selecione o gênero" }),
	birthDate: z.string().optional(),
})

type RegisterData = z.infer<typeof registerSchema>

export default function RegisterPage() {
	const supabase = createClient()
	const router = useRouter()
	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<RegisterData>({
		resolver: zodResolver(registerSchema),
	})
	const [registrationError, setRegistrationError] = useState<string | null>(null)
	const [showPassword, setShowPassword] = useState(false)

	const onSubmit = async (data: RegisterData) => {
		const { fullName, email, password, gender, birthDate } = data
		setRegistrationError(null)

		// Verificação de e-mail já cadastrado usando o SDK
		const { data: existingUser, error: emailCheckError } = await supabase.from("users").select("email").eq("email", email).single()

		if (emailCheckError && emailCheckError.code !== "PGRST116") {
			console.error("Erro ao verificar e-mail:", emailCheckError.message)
			setRegistrationError("Erro ao verificar e-mail. Tente novamente.")
			return
		}

		if (existingUser) {
			setError("email", { type: "manual", message: "Este e-mail já existe. Faça login." })
			return
		}

		// Registro do usuário no Supabase Auth
		const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${window.location.origin}/confirm`, // URL para redirecionar após a confirmação do e-mail
			},
		})

		const user = signUpData?.user

		if (signUpError || !user) {
			console.error("Erro ao registrar:", signUpError?.message || "Usuário não encontrado")
			setRegistrationError("Erro ao registrar usuário. Aguarde alguns minutos e tente novamente.")
			return
		}

		// Insere os dados adicionais na tabela 'users' associando o ID do Supabase
		const { error: profileError } = await supabase.from("users").insert([
			{
				id: user.id,
				full_name: fullName,
				email,
				gender,
				birth_date: birthDate || null,
			},
		])

		if (profileError) {
			console.error("Erro ao inserir dados do perfil:", profileError.message)
			setRegistrationError("Erro ao criar perfil. Aguarde alguns minutos e tente novamente.")
			return
		}

		// Redireciona para a página de aviso de verificação de e-mail
		router.push("/verify-email")
	}

	return (
		<div className='max-w-sm mx-auto p-4'>
			<form onSubmit={handleSubmit(onSubmit)} className='max-w-sm mx-auto p-4'>
				<h1 className='text-3xl font-bold mb-4'>Cadastre-se</h1>

				{/* Nome Completo */}
				<div className='mb-4'>
					<label htmlFor='fullName' className='block text-sm font-medium text-gray-700'>
						Nome Completo
					</label>
					<input id='fullName' type='text' {...register("fullName")} autoComplete='name' className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Digite seu nome completo' />
					{errors.fullName && <p className='text-red-500 text-sm mt-1'>{errors.fullName.message}</p>}
				</div>

				{/* E-mail */}
				<div className='mb-4'>
					<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
						E-mail
					</label>
					<input id='email' type='email' {...register("email")} autoComplete='email' className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Digite seu e-mail' />
					{errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
				</div>

				{/* Senha */}
				<div className='mb-4'>
					<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
						Senha
					</label>
					<div className='relative'>
						<input id='password' type={showPassword ? "text" : "password"} {...register("password")} autoComplete='new-password' className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Digite sua senha' />
						<button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-800 focus:outline-none'>
							{showPassword ? "Ocultar" : "Mostrar"}
						</button>
					</div>
					{errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
				</div>

				{/* Gênero */}
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

				{/* Data de Nascimento */}
				<div className='mb-4'>
					<label htmlFor='birthDate' className='block text-sm font-medium text-gray-700'>
						Data de Nascimento (opcional)
					</label>
					<input id='birthDate' type='date' {...register("birthDate")} className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' />
					{errors.birthDate && <p className='text-red-500 text-sm mt-1'>{errors.birthDate.message}</p>}
				</div>

				{registrationError && <p className='text-red-500 text-sm mt-4'>{registrationError}</p>}

				<div>
					<button type='submit' className='w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition'>
						Cadastrar
					</button>
				</div>
			</form>

			<div className='mt-2 text-center'>
				<p className='text-sm text-gray-600'>
					Já tem uma conta?{" "}
					<a href='/login' className='text-indigo-600 hover:text-indigo-500 font-medium'>
						Faça login
					</a>
				</p>
			</div>
		</div>
	)
}
