// Página de Esqueceu a senha
// src/app/(auth)/forgot-password/page.tsx

// Esta página permite que o usuário insira seu e-mail para receber um link de redefinição de senha,
// utilizando React Hook Form para lidar com o formulário e Zod para validação.

"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/utils/supabase/client" // Importa o cliente configurado para o navegador
import { useState } from "react"

// Esquema de validação para o formulário de esquecimento de senha
const forgotPasswordSchema = z.object({
	email: z.string().email("E-mail inválido"),
})

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
	const supabase = createClient()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordData>({
		resolver: zodResolver(forgotPasswordSchema),
	})
	const [message, setMessage] = useState<string | null>(null)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const onSubmit = async (data: ForgotPasswordData) => {
		const { email } = data
		setMessage(null)
		setErrorMessage(null)

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`,
		})

		if (error) {
			console.error("Erro ao enviar e-mail de recuperação:", error.message)
			setErrorMessage("Erro ao enviar e-mail de recuperação. Tente novamente.")
			return
		}

		setMessage("E-mail de recuperação enviado! Verifique sua caixa de entrada.")
	}

	return (
		<div className='max-w-md mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>Recuperar Senha</h1>
			<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
				{/* Campo de E-mail */}
				<div>
					<label htmlFor='email' className='block text-sm font-medium'>
						E-mail
					</label>
					<input id='email' type='email' {...register("email")} className='mt-1 block w-full p-2 border rounded-md' placeholder='Digite seu e-mail' />
					{errors.email && <span className='text-red-500 text-sm'>{errors.email.message}</span>}
				</div>

				{/* Botão de Enviar */}
				<button type='submit' className='w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition'>
					Recuperar Senha
				</button>

				{/* Mensagens de Sucesso ou Erro */}
				{message && <p className='text-green-500 text-sm mt-4'>{message}</p>}
				{errorMessage && <p className='text-red-500 text-sm mt-4'>{errorMessage}</p>}
			</form>
		</div>
	)
}
