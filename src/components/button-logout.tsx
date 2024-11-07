// src/components/button-logout.tsx

"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function LogoutButton() {
	const router = useRouter()
	const supabase = createClient() // Cria a instância do cliente

	const handleLogout = async () => {
		await supabase.auth.signOut() // Realiza o logout no Supabase
		router.push("/login") // Redireciona para a página de login após o logout
	}

	return (
		<button onClick={handleLogout} className='bg-red-500 text-white py-1 px-4 rounded-md hover:bg-red-600 transition'>
			Sair
		</button>
	)
}
