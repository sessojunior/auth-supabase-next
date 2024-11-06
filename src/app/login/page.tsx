// Página src/app/login/page.tsx com um formulário de login, incluindo campos para e-mail e senha, além do botão de exibir/ocultar senha.

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "@/lib/supabase/client"
import { useState } from "react"

import { FaGoogle, FaFacebook, FaInstagram } from "react-icons/fa"

// Esquema de validação com Zod
const loginSchema = z.object({
	email: z.string().email("E-mail inválido"),
	password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
})

// Tipo dos dados do formulário
type LoginData = z.infer<typeof loginSchema>

export default function LoginPage() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginData>({
		resolver: zodResolver(loginSchema),
	})

	// Estado para controlar a visibilidade da senha
	const [showPassword, setShowPassword] = useState(false)

	const onSubmit = async (data: LoginData) => {
		const { email, password } = data
		const { error } = await supabase.auth.signInWithPassword({ email, password })

		if (error) {
			console.error("Erro ao fazer login:", error.message)
			return
		}

		alert("Login realizado com sucesso!")
	}

	// Função que aceita o provedor como argumento e tenta fazer login via OAuth com Supabase,
	// exibindo os ícones apropriados.
	const handleSocialLogin = async (provider: "google" | "facebook") => {
		const { error } = await supabase.auth.signInWithOAuth({ provider })
		if (error) console.error("Erro ao realizar login social:", error.message)
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='max-w-sm mx-auto p-4'>
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
				<div className='relative'>
					<input id='password' type={showPassword ? "text" : "password"} {...register("password")} className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Digite sua senha' />
					<button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-800 focus:outline-none'>
						{showPassword ? "Ocultar" : "Mostrar"}
					</button>
				</div>
				{errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
			</div>

			{/* Botão de Enviar */}
			<div className='mb-4'>
				<button type='submit' className='w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition'>
					Entrar
				</button>
			</div>

			<div className='social-login'>
				<button onClick={() => handleSocialLogin("google")}>
					<FaGoogle size={20} /> Login com Google
				</button>
				<button onClick={() => handleSocialLogin("facebook")}>
					<FaFacebook size={20} /> Login com Facebook
				</button>
			</div>
		</form>
	)
}
