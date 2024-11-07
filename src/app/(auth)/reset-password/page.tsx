// Página de redefinição de senha
// src/app/(auth)/reset-password/page.tsx

// Esta página de redefinição de senha no lado do cliente redefine a senha usando o link de redefinição enviado para o e-mail do usuário.

"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/utils/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"

// Esquema de validação para a redefinição de senha
const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
		confirmPassword: z.string().min(8, "Confirme a senha"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"],
	})

type ResetPasswordData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
	const supabase = createClient()
	const router = useRouter()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordData>({
		resolver: zodResolver(resetPasswordSchema),
	})
	const [message, setMessage] = useState<string | null>(null)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const onSubmit = async (data: ResetPasswordData) => {
		const { password } = data
		setErrorMessage(null)
		setMessage(null)

		const { error } = await supabase.auth.updateUser({ password })

		if (error) {
			console.error("Erro ao redefinir senha:", error.message)
			setErrorMessage("Erro ao redefinir senha. Tente novamente.")
			return
		}

		setMessage("Senha redefinida com sucesso! Você será redirecionado para a página de login.")
		setTimeout(() => router.push("/login"), 3000) // Redireciona para a página de login após 3 segundos
	}

	return (
		<div className='max-w-md mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>Redefinir Senha</h1>
			<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
				{/* Campo de Nova Senha */}
				<div>
					<label htmlFor='password' className='block text-sm font-medium'>
						Nova Senha
					</label>
					<input id='password' type='password' {...register("password")} className='mt-1 block w-full p-2 border rounded-md' placeholder='Digite a nova senha' />
					{errors.password && <span className='text-red-500 text-sm'>{errors.password.message}</span>}
				</div>

				{/* Campo de Confirmação de Senha */}
				<div>
					<label htmlFor='confirmPassword' className='block text-sm font-medium'>
						Confirmar Senha
					</label>
					<input id='confirmPassword' type='password' {...register("confirmPassword")} className='mt-1 block w-full p-2 border rounded-md' placeholder='Confirme a nova senha' />
					{errors.confirmPassword && <span className='text-red-500 text-sm'>{errors.confirmPassword.message}</span>}
				</div>

				{/* Botão de Enviar */}
				<button type='submit' className='w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition'>
					Redefinir Senha
				</button>

				{/* Mensagens de Sucesso ou Erro */}
				{message && <p className='text-green-500 text-sm mt-4'>{message}</p>}
				{errorMessage && <p className='text-red-500 text-sm mt-4'>{errorMessage}</p>}
			</form>
		</div>
	)
}
