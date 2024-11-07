// Página de Aviso de Verificação de E-mail
// src/app/(auth)/verify-email/page.tsx

// Esta é uma página com uma mensagem informando o usuário sobre a necessidade de verificar o e-mail.
// Essa página informa ao usuário que ele precisa verificar o e-mail clicando no link de confirmação.

export default function VerifyEmailPage() {
	return (
		<div className='max-w-md mx-auto p-6 text-center'>
			<h1 className='text-2xl font-bold mb-4'>Verifique seu E-mail</h1>
			<p className='text-gray-700'>Um e-mail de confirmação foi enviado para o e-mail fornecido. Por favor, aguarde alguns minutos e verifique sua caixa de entrada. Abra o e-mail de confirmação e clique no link de confirmação para ativar sua conta.</p>
		</div>
	)
}
