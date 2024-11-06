// Página src/app/reset-password/page.tsx redefine a senha usando o link de redefinição enviado para o e-mail do usuário.
// Essa página processa a redefinição da senha ao enviar a nova senha para o Supabase e mostra uma mensagem de sucesso ao usuário.

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/lib/supabase/client"
import { useState } from "react"

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
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordData>({
		resolver: zodResolver(resetPasswordSchema),
	})
	const [message, setMessage] = useState("")

	const onSubmit = async (data: ResetPasswordData) => {
		const { password } = data
		const { error } = await supabase.auth.updateUser({ password })

		if (error) {
			console.error("Erro ao redefinir senha:", error.message)
			return
		}

		setMessage("Senha redefinida com sucesso!")
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<input {...register("password")} type='password' placeholder='Nova senha' />
			{errors.password && <span>{errors.password.message}</span>}
			<input {...register("confirmPassword")} type='password' placeholder='Confirme a senha' />
			{errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
			<button type='submit'>Redefinir Senha</button>
			{message && <p>{message}</p>}
		</form>
	)
}
