# Autenticação com Next.js e Supabase e CRUD de tarefas

Este projeto utiliza o Supabase, React Hook Form, Zod, Shadcn/UI para criar um sistema de autenticação com Next.js, utilizando validações nos formulários. Também permite o gerenciamento completo de tarefas com um CRUD após o login.

## Requisitos do sistema

- Cadastro de usuários
- Login com e-mail e senha
- Login com provedor social (Google e Facebook)
- Página de esqueceu a senha
- Página de recuperar senha
- Página de confirmação de login usando OTP (2FA)
- Rota pública da página inicial
- Rotas privadas na administração
- CRUD de tarefas

## Estrutura do projeto

Aqui está a estrutura do seu projeto com os diretórios e subdiretórios:

```bash
/src
├── /app
│   ├── /(auth)                        // Diretório para autenticação
│   │   ├── /confirm
│   │   │   └── page.tsx
│   │   ├── /forgot-password
│   │   │   └── page.tsx
│   │   ├── /login
│   │   │   └── page.tsx
│   │   ├── /register
│   │   │   └── page.tsx
│   │   ├── /reset-password
│   │   │   └── page.tsx
│   │   └── /verify-otp
│   │       └── page.tsx
│   ├── /admin                         // Diretório para páginas protegidas (admin)
│   │   ├── /profile
│   │   │   └── page.tsx
│   │   ├── /tasks
│   │   │   └── page.tsx
│   │   └── page.tsx                   // Página principal do admin (dashboard)
├── /utils
│   └── /supabase
│       ├── client.ts                  // Configuração do cliente do Supabase para o navegador
│       ├── server.ts                  // Configuração do cliente do Supabase para o servidor
│       └── middleware.ts              // Função de middleware para gerenciamento de sessão
├── middleware.ts                      // Arquivo de middleware para proteger as rotas
```

## 1. Dependências

Fazer as seguintes instalações de dependências:

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs

# Armazenar o token no cookie
npm install js-cookie
npm install --save-dev @types/js-cookie

# React Hook Form e Zod para formulários e validação
npm install react-hook-form @hookform/resolvers zod

# React Icons
npm install react-icons

# Shadcn/UI para componentes UI pré-configurados
npx shadcn@latest init
```

## 2. Configurando o Supabase

No painel do Supabase, ir para a seção _SQL Editor_ e executar o seguinte script para criar as tabelas:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY, -- ID que será igual ao ID de autenticação do Supabase
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  gender VARCHAR(10),
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
```

Essa estrutura cria uma tabela de usuários com os campos necessários, incluindo a data de nascimento e gênero, e uma tabela de tasks para o CRUD.

Com essa estrutura, o id na tabela users corresponde ao id do Supabase Auth. Essa correspondência nos permite garantir que cada usuário autenticado tenha um perfil correspondente.

### 2.1 Configurar o Modelo de E-mail no Supabase

É importante configurar corretamente a confirmação de autenticação (confirmação de e-mail) no Supabase, especialmente se você ativou a confirmação de e-mail para novos usuários.

#### 2.1.1 Passo 1: Painel do Supabase

Acesse o painel do Supabase e vá para a seção **Authentication** > **Email Templates**.

No modelo de confirmação de e-mail (**E-mail Templates** > **Confirm signup**), altere a URL padrão do e-mail de confirmação de:

```bash
{{ .ConfirmationURL }}
```

para:

```bash
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
```

Isso define o link de confirmação no e-mail para redirecionar o usuário à rota **/auth/confirm**, que lida com a confirmação e redirecionamento da página.

#### 2.1.2 Passo 2: Manipulador de Rota para auth/confirm

O manipulador **auth/confirm/route.ts** usa GET para processar a confirmação. Esse manipulador recebe o token_hash e o type do link de confirmação no e-mail. Ele usa esses parâmetros para verificar o código e autenticar o usuário.

#### 2.1.3 Passo 3: Verificar o processo

1. Cadastro e Confirmação de E-mail:

Ao se registrar, o usuário deve receber um e-mail com o link de confirmação correto, que redireciona para **/auth/confirm**.

2. Redirecionamento Após Confirmação:

Após a confirmação bem-sucedida, o usuário deve ser redirecionado para a página **/admin**.

Com essa configuração, a confirmação de e-mail será corretamente processada e o usuário será redirecionado após o login ou confirmação de e-mail.

### 2.2 Configurar o Redirecionamento após Login com OAuth

Para configurar o Redirecionamento no Supabase:

1. Acesse o painel do Supabase.
2. Navegue até **Authentication** > **URL Configuration**.
3. No campo **Redirect URLs**, adicione uma URL que você quer como destino final após o login, por exemplo: **http://localhost:3000/admin**.

Essa configuração ajuda o Supabase a redirecionar o usuário para a página **/admin** após o login.

### 2.3 Configurações para permitir cadastrar todos os e-mails

Para permitir que seja possível cadastrar e-mails de todos os usuários, caso dê algum erro assim: _Email address "usuario@gmail.com" cannot be used as it is not authorized_, é preciso fazer algumas configurações.

O Supabase, por padrão, permite o envio de e-mails apenas para endereços autorizados, geralmente os membros da equipe do projeto. Isso é uma medida de segurança para evitar abusos durante o desenvolvimento inicial.

Para resolver esse problema e permitir que usuários externos se cadastrem, é preciso configurar um servidor SMTP personalizado no Supabase. Isso permitirá o envio de e-mails de confirmação e outras notificações para qualquer endereço de e-mail.

#### Obter SMTP do SendGrid

1. Para obter esses dados, crie uma conta e faça o login
2. Após isso, acesse **E-mail API** > **Integration Guide**.
3. Selecione **SMTP Relay**.
4. Crie um nome para a chave de API e salve-a em algum local seguro.
5. Anote as seguintes informações:

- Chave de API (API Key)
- Host do servidor SMTP (Server): smtp.sendgrid.net
- Porta (Ports): 25 ou 587 (para TLS) e 465 (para SSL)
- Nome de usuário (Username): apikey
- Senha (Password): [É a API Key]
- Endereço de e-mail do remetente: silo.inpe@gmail.com

#### Usar o SMTP do próprio Gmail

Não é mais uma opção. O Gmail não oferece mais suporte a apps de terceiros ou a dispositivos em que você precisa compartilhar o nome de usuário e a senha do Google. O compartilhamento das credenciais da sua conta com terceiros facilita o acesso dos hackers.

Mais informações do Google podem ser encontradas clicando neste [link](https://support.google.com/mail/answer/7126229?authuser=3&visit_id=638665317789803158-3866687335&hl=pt-BR&rd=1).

#### Configure o SMTP no Supabase

1. Acesse o painel do Supabase.
2. Navegue até **Authentication** > **SMTP Settings**.
3. Na seção **SMTP Settings**, ative **Enable Custom SMTP** e insira as informações obtidas:

- Sender email: Endereço de e-mail do remetente. Ex: silo.inpe@gmail.com
- Sender name: Nome que aparecerá como remetente. Ex: Silo
- Host: Host do servidor SMTP. Ex: smtp.sendgrid.net
- Port number: Porta do servidor SMTP. Ex: 465
- Username: Nome de usuário do SMTP. Ex: apikey
- Password: Senha do SMTP. É a API Key do SendGrid

4. Salve as configurações.
5. Teste o envio de e-mails:

- Tente registrar um novo usuário para verificar se o e-mail de confirmação é enviado corretamente.

Em caso de erro, teste se o envio com SMTP está funcionando com uma ferramenta de teste como a [SMTP Server](https://smtpserver.com/smtptest)

#### Observações importantes

**Limitações do SMTP padrão do Supabase**: O Supabase fornece um servidor SMTP padrão para testes, mas ele é limitado a enviar e-mails apenas para endereços autorizados (geralmente os membros da equipe) e possui restrições de taxa de envio. Portanto, não é adequado para uso em produção. SUPABASE

**Configuração de SPF, DKIM e DMARC**: Para melhorar a entregabilidade dos e-mails e evitar que sejam marcados como spam, configure os registros SPF, DKIM e DMARC no seu domínio. Isso é geralmente feito no painel de controle do seu provedor de domínio.

**Personalização de templates de e-mail**: Após configurar o SMTP, você pode personalizar os templates de e-mail enviados pelo Supabase para adequá-los à identidade visual da sua aplicação.

Seguindo esses passos, você permitirá que usuários externos se registrem na sua aplicação, recebendo os e-mails necessários para confirmação e outras notificações.

## 3. Conexão do Frontend com o Supabase

Criar um arquivo **.env.local** na raiz do projeto e adicionar suas chaves do Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=seu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu-supabase-anon-key
```

## 4. Páginas e Componentes do Sistema de Autenticação

Estas são as principais páginas de autenticação: **Cadastro**, **Login**, **Recuperar Senha**, **Esqueceu a Senha** e **Confirmação de Login com OTP**.

### 4.1 Página de Cadastro

Página **src/app/register/page.tsx** com o formulário de cadastro, utilizando React Hook Form e Zod para validação.

### 4.2 Página de Login

Página **src/app/login/page.tsx** com um formulário de login, incluindo campos para e-mail e senha, além do botão de exibir/ocultar senha.

### 4.3 Login Social (Google e Facebook)

No Supabase, ativar o login social nas configurações de autenticação, configurando as credenciais do OAuth para o Google. Após configurar, obtenha as credenciais de cliente (**Client ID** e **Client Secret**) e adicione-as em variáveis de ambiente no arquivo **.env.local**:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-google-client-id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

O arquivo _src/app/login/page.tsx_, deverá ter os botões para login social, os ícones e o redirecionamento com Supabase.

#### 4.3.1 Configurar OAuth no Google

**Passo a Passo:**

1. Acesse o console de desenvolvedor do Google: https://console.developers.google.com/.
2. Clique em **Selecionr um projeto** e depois em **Novo Projeto** para criar um novo projeto.
3. Defina um nome para o projeto, por exemplo, _Silo_, e clique em **Criar**.
4. Com o projeto selecionado, vá até **Tela de permissão OAuth** no menu lateral.
5. Em **User Type**, escolha **Externo** e clique em **Criar**.
6. Preencha os detalhes da tela de consentimento, com o nome do aplicativo, e-mail para suporte do usuário, e-mail de contato do desenvolvedor e informações adicionais que deseja exibir aos usuários. Em seguida, clique em **Salvar e Continuar**.
7. Após configurar a tela de consentimento, vá até **Credenciais** no menu lateral e clique em **Criar Credenciais** > **ID do cliente OAuth**.
8. Em **Tipo de aplicativo**, selecione **Aplicativo da Web**.
9. Defina um nome para as credenciais, como por exemplo, _Cliente Web_. Anote o ID do cliente e a Chave secreta do cliente, pois serão usadas depois.
10. Na lista de **IDs do Cliente OAuth 2.0**, no nome da credencial que criou, clique no ícone de caneta, **Editar cliente OAuth**.
11. Em **URIs de redirecionamento autorizados**, clique em **Adicionar URI** para adicionar uma URL de redirecionamento do Supabase: **_https://[SEU-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback_**. Substitua **_[SEU-SUPABASE-PROJECT-REF]_** pelo ID do seu projeto Supabase e clique em **Salvar**.
12. Para pegar novamente as credenciais, entre na tela de **Credenciais**, no menu lateral, clique no nome do cliente que você deu em **IDs do cliente OAuth 2.0**. Em **Additional information**, copie o **ID do cliente** e em **Chaves secretas do cliente** copie a **Chave secreta do cliente**.

**Variáveis de Ambiente:** Salve as credenciais no arquivo **.env.local**:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-google-client-id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

#### 4.3.2 Configurar OAuth no Facebook

**Passo a Passo:**

1. Acesse o Facebook for Developers: https://developers.facebook.com/ e faça login no Facebook.
2. Clique em **Começar** e na tela de criação de conta do Meta for Developers, clique em **Continuar**, insira as informações solicitadas, número de telefone, confirme o e-mail, escolha o perfil **Desenvolvedor** e pronto.
3. Após criar a conta de desenvolvedor, clique em **Meus apps** no canto superior direito e depois em **Criar aplicativo**.
4. Em Casos de uso, selecione **Autenticar e solicitar dados de usuários com o Login do Facebook** e clique em **Avançar**.
5. Em **A qual portfólio empresarial você quer conectar o app?** deixe selecionado **Ainda não quero me conectar a um portfólio empresarial.** e clique em **Avançar**.
6. Defina um nome para o aplicativo, como por exemolo, _Silo_, e informe o e-mail de contato e clique em **Avançar**.
7. A Meta informa que é necessário fazer a verificação da empresa e análise do app para publicar o app e manter o acesso aos dados. Clique em **Acessar painel**.
8. No menu lateral, vá até **Configurações do app** > **Básico** e preencha as informações adicionais do aplicativo.
9. No menu lateral, vá para **Casos de uso** e em **Autenticar e solicitar dados de usuários com o Login do Facebook** adicione o **Facebook Login** como produto.
10. Em **Client OAuth Settings**, clique em **Personalizar**.
11. Em **Login com o Facebook**, clique em **Configurações** e em **Validador da URI de redirecionamento**, configure a **URI de redirecionamento para verificar** com a URL de redirecionamento do Supabase: **_https://[SEU-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback_**.
12. Clique em **Verificar URI** para salvar as alterações.
13. Volte para **Configurações do app** > **Básico** e copie o **ID do Aplicativo** e a **Chave Secreta do Aplicativo**.

**Variáveis de Ambiente:** Salve as credenciais no arquivo **.env.local**:

```bash
NEXT_PUBLIC_FACEBOOK_CLIENT_ID=seu-facebook-app-id NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET=seu-facebook-app-secret
```

#### 4.3.4 Configurar no Supabase

Após salvar as credenciais no arquivo **.env.local**, você precisa configurar as mesmas no painel do Supabase:

1. Acesse o painel do Supabase em https://app.supabase.io/.
2. Selecione o seu projeto.
3. No menu lateral clique em **Authentication** e no menu lateral a seguir em **Providers**.
4. Na seção **Auth Providers**, ative **Google** e **Facebook**.
5. Insira o **Client ID** e o **Client Secret** para cada provedor, usando os valores configurados e salve as alterações.

#### Atualizar o Supabase no Código

Certifique-se de que o código de autenticação na aplicação está utilizando os provedores de login social configurados. Por exemplo:

```javascript
const handleSocialLogin = async (provider) => {
	const { error } = await supabase.auth.signInWithOAuth({ provider })
	if (error) console.error("Erro ao fazer login com o provedor:", error.message)
}
```

Esses passos permitem a configuração do login social no Supabase com Google e Facebook, usando as credenciais fornecidas e definidas em variáveis de ambiente.

### 4.4 Recuperação e Redefinição de Senha

Para implementar o fluxo de redefinição de senha, temos duas páginas: **Recuperar Senha** e **Redefinir Senha**.

#### 4.4.1 Página de Recuperação de Senha

Página **src/app/forgot-password/page.tsx** envia um link de redefinição para o e-mail do usuário.

Essa página permite ao usuário solicitar um e-mail de redefinição de senha ao digitar seu e-mail. O Supabase cuidará de enviar o link de redefinição.

#### 4.4.1 Página de Redefinição de Senha

Página **src/app/reset-password/page.tsx** redefine a senha usando o link de redefinição enviado para o e-mail do usuário.

Essa página processa a redefinição da senha ao enviar a nova senha para o Supabase e mostra uma mensagem de sucesso ao usuário.

### 4.5 Autenticação com 2FA e OTP por E-mail

A autenticação com OTP (One-Time Password) adiciona uma camada de segurança.

Página de Confirmação com OTP **src/app/verify-otp/page.tsx** para a verificação de login com OTP.

O formulário da página solicita o código OTP e verifica o código na lógica de back-end.

### 4.6 Rotas Privadas para Dashboard e Admin

No Next.js, o controle de rotas privadas é feito utilizando um middleware para verificar se o usuário está autenticado.

#### Middleware para Rotas Privadas

O middleware **src/middleware.ts** é para proteger as rotas **/admin** e **/dashboard**.

## 5. CRUD de tarefas

Abaixo, está a estrutura que vamos seguir para o CRUD de tarefas:

1. **Página de Listagem**: Lista todas as tarefas do usuário.
2. **Página de Criação**: Permite a criação de novas tarefas.
3. **Página de Visualização**: Exibe detalhes de uma tarefa específica.
4. **Página de Edição**: Permite editar uma tarefa existente.
5. **Exclusão de Tarefas**: Adiciona a opção de excluir uma tarefa.

### Estrutura da Tabela tasks no Supabase

Certifique-se de que a tabela tasks tenha a seguinte estrutura no Supabase:

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
```

### 5.1 Página de Listagem de Tarefas

Página **src/app/tasks/page.tsx** lista todas as tarefas criadas pelo usuário autenticado.

Exibe uma lista de tarefas com links para cada tarefa individual. Ao clicar em uma tarefa, o usuário é levado à página de detalhes.

### 5.2 Página de Criação de Tarefas

Página **src/app/tasks/new/page.tsx** permite ao usuário criar uma nova tarefa, preenchendo os campos de título e descrição.

Essa página contém um formulário com React Hook Form, onde o usuário insere o título e a descrição da tarefa.

### 5.3 Página de Visualização de Tarefas

Página **src/app/tasks/[id]/page.tsx** exibe os detalhes de uma tarefa específica.

Essa página usa o id da URL para buscar e exibir os detalhes de uma tarefa. Inclui um botão para navegar até a página de edição.

### 5.4 Página de Edição de Tarefas

Página **src/app/tasks/[id]/edit/page.tsx** permite ao usuário atualizar uma tarefa existente.

Essa página permite a edição de uma tarefa existente, populando os campos com os dados atuais da tarefa.

### 5.5 Exclusão de Tarefas

Para excluir uma tarefa, tem um botão de exclusão na página de detalhes **src/app/tasks/[id]/page.tsx**. Esse botão exclui a tarefa do Supabase e redireciona o usuário de volta para a lista de tarefas.

## Resumo

Este guia continua a desenvolver um sistema completo de autenticação, completando as funcionalidades de login social com e-mail e senha, provedor social, recuperação de senha, 2FA com OTP e rotas privadas.

O CRUD de tarefas tem a listagem, criação, visualização, edição e exclusão das tarefas após o login.
