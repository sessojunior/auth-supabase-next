// Página de autenticação com OTP (One-Time Password)
// src/app/(auth)/verify-otp/page.tsx

// Esta página adiciona uma camada de segurança.
// O formulário da página solicita o código OTP e verifica o código na lógica de backend.

"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

// Esquema de validação para o código OTP
const otpSchema = z.object({
	otp: z.string().length(6, "O código deve ter 6 dígitos"),
})

type OTPData = z.infer<typeof otpSchema>

export default function VerifyOTPPage() {
	const supabase = createClient()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<boolean>(false)
	const router = useRouter()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<OTPData>({
		resolver: zodResolver(otpSchema),
	})

	const onSubmit = async (data: OTPData) => {
		setLoading(true)
		setError(null)
		setSuccess(false)

		// Obtém o e-mail do usuário atual armazenado no Supabase Auth
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) {
			setError("Erro ao obter o usuário autenticado.")
			setLoading(false)
			return
		}

		// Verificação do OTP
		const { error: otpError } = await supabase.auth.verifyOtp({
			email: user.email!,
			token: data.otp,
			type: "signup", // Altere para 'recovery' ou outro tipo conforme necessário
		})

		if (otpError) {
			setError("Código OTP inválido ou expirado. Tente novamente.")
		} else {
			setSuccess(true)
			router.push("/dashboard") // Redireciona para o dashboard após sucesso
		}

		setLoading(false)
	}

	return (
		<div className='flex flex-col items-center justify-center min-h-screen p-4'>
			<h1 className='text-xl font-semibold mb-4'>Verificação de OTP</h1>
			<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col items-center'>
				<input {...register("otp")} placeholder='Digite o código OTP' className='border p-2 mb-2 rounded-md' />
				{errors.otp && <span className='text-red-500 text-sm'>{errors.otp.message}</span>}
				{error && <span className='text-red-500 text-sm mt-1'>{error}</span>}
				{success && <span className='text-green-500 text-sm mt-1'>Código verificado com sucesso!</span>}

				<button type='submit' className='bg-blue-500 text-white p-2 mt-4 rounded-md' disabled={loading}>
					{loading ? "Verificando..." : "Verificar"}
				</button>
			</form>
		</div>
	)
}
