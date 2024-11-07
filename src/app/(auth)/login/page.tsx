// Página de Login
// src/app/(auth)/login/page.tsx

// Esta página de login no lado do cliente chama a função de autenticação do Supabase para autenticar o usuário.

"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/utils/supabase/client" // Cliente configurado para o navegador
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaGoogle } from "react-icons/fa"

// Esquema de validação com Zod
const loginSchema = z.object({
	email: z.string().email("E-mail inválido"),
	password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
})

type LoginData = z.infer<typeof loginSchema>

export default function LoginPage() {
	const supabase = createClient()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
	const [showPassword, setShowPassword] = useState(false)
	const [loginError, setLoginError] = useState<string | null>(null)
	const router = useRouter()

	// Verifica e processa o token de login social no hash da URL
	useEffect(() => {
		const hash = window.location.hash
		if (hash) {
			const params = new URLSearchParams(hash.substring(1))
			const accessToken = params.get("access_token")
			const refreshToken = params.get("refresh_token")

			if (accessToken && refreshToken) {
				supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(() => {
					window.history.replaceState(null, "", window.location.pathname)
					router.push("/admin") // Redireciona para /admin após login bem-sucedido
				})
			}
		}
	}, [router, supabase.auth])

	const onSubmit = async (data: LoginData) => {
		setLoginError(null)
		const { data: loginData, error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		})

		if (error) {
			setLoginError("E-mail ou senha incorretos.")
			return
		}

		// Redireciona para o /admin após o login bem-sucedido
		if (loginData.session) {
			router.push("/admin")
		}
	}

	const handleSocialLogin = async (provider: "google") => {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/admin`, // Redireciona para o domínio atual da aplicação com /admin após o login bem-sucedido
			},
		})

		if (error) {
			console.error("Erro ao realizar login social:", error.message)
			return
		}

		if (data?.url) {
			window.location.href = data.url
		}
	}

	return (
		<div className='max-w-sm mx-auto p-4'>
			<h1 className='text-3xl font-bold mb-4'>Login</h1>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className='mb-4'>
					<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
						E-mail
					</label>
					<input id='email' type='email' {...register("email")} autoComplete='email' className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Digite seu e-mail' />
					{errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
				</div>

				<div className='mb-4'>
					<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
						Senha
					</label>
					<div className='relative'>
						<input id='password' type={showPassword ? "text" : "password"} {...register("password")} autoComplete='current-password' className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Digite sua senha' />
						<button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-800 focus:outline-none'>
							{showPassword ? "Ocultar" : "Mostrar"}
						</button>
					</div>
					{errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
				</div>

				{loginError && <p className='text-red-500 text-sm mt-4'>{loginError}</p>}

				<div className='mb-4'>
					<button type='submit' className='w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition'>
						Entrar
					</button>
				</div>
			</form>

			<div className='mt-6'>
				<button onClick={() => handleSocialLogin("google")} className='flex items-center justify-center w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition mb-2'>
					<FaGoogle size={20} className='mr-2' /> Entrar com Google
				</button>
			</div>

			<div className='mt-6 text-center'>
				<p className='text-sm text-gray-600'>
					Não tem uma conta?{" "}
					<a href='/register' className='text-indigo-600 hover:text-indigo-500 font-medium'>
						Cadastre-se
					</a>
				</p>
			</div>
		</div>
	)
}
