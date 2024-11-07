// Home Page
// src/app/page.tsx

import Link from "next/link"

export default function HomePage() {
	return (
		<div className='max-w-2xl mx-auto p-4'>
			<h1 className='text-3xl font-bold mb-4'>Bem-vindo à Página Pública</h1>
			<p>Esta página está acessível para todos os usuários, autenticados ou não.</p>
			<p>
				<Link href='/login' className='text-blue-500 underline'>
					Ir para a página de login
				</Link>
			</p>
			<p>
				<Link href='/admin/profile' className='text-blue-500 underline'>
					Ir para a página privada de admin - profile
				</Link>
			</p>
			<p>
				<Link href='/admin/tasks' className='text-blue-500 underline'>
					Ir para a página privada de admin - tasks
				</Link>
			</p>
			{/* Conteúdo adicional */}
		</div>
	)
}
