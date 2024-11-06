// Página src/app/forgot-password/page.tsx envia um link de redefinição para o e-mail do usuário.
// Essa página permite ao usuário solicitar um e-mail de redefinição de senha ao digitar seu e-mail. O Supabase cuidará de enviar o link de redefinição.

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/lib/supabase/client"

const forgotPasswordSchema = z.object({
	email: z.string().email("E-mail inválido"),
})

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordData>({
		resolver: zodResolver(forgotPasswordSchema),
	})

	const onSubmit = async (data: ForgotPasswordData) => {
		const { email } = data
		const { error } = await supabase.auth.resetPasswordForEmail(email)

		if (error) {
			console.error("Erro ao enviar e-mail de recuperação:", error.message)
			return
		}

		alert("E-mail de recuperação enviado!")
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<input {...register("email")} placeholder='Digite seu e-mail' />
			{errors.email && <span>{errors.email.message}</span>}
			<button type='submit'>Recuperar Senha</button>
		</form>
	)
}
