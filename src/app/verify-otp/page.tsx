// A autenticação com OTP (One-Time Password) adiciona uma camada de segurança.
// Página de Confirmação com OTP src/app/verify-otp/page.tsx para a verificação de login com OTP.
// O formulário da página solicita o código OTP e verifica o código na lógica de back - end.

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const otpSchema = z.object({
	otp: z.string().length(6, "O código deve ter 6 dígitos"),
})

type OTPData = z.infer<typeof otpSchema>

export default function VerifyOTPPage() {
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

		// Use o método correto 'verifyOtp'
		const { error: otpError } = await supabase.auth.verifyOtp({
			email: "user@example.com", // Substitua pelo e-mail do usuário atual
			token: data.otp,
			type: "signup", // Tipo da verificação (ex: 'signup', 'recovery')
		})

		if (otpError) {
			setError("Código OTP inválido ou expirado. Tente novamente.")
		} else {
			setSuccess(true)
			router.push("/dashboard") // Redireciona para a página desejada após sucesso
		}

		setLoading(false)
	}

	return (
		<div className='flex flex-col items-center justify-center min-h-screen p-4'>
			<h1 className='text-xl font-semibold mb-4'>Verificação de OTP</h1>
			<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col items-center'>
				<input {...register("otp")} placeholder='Digite o código OTP' className='border p-2 mb-2' />
				{errors.otp && <span className='text-red-500'>{errors.otp.message}</span>}
				{error && <span className='text-red-500'>{error}</span>}
				{success && <span className='text-green-500'>Código verificado com sucesso!</span>}
				<button type='submit' className='bg-blue-500 text-white p-2 mt-2' disabled={loading}>
					{loading ? "Verificando..." : "Verificar"}
				</button>
			</form>
		</div>
	)
}
