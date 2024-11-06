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

## 1. Dependências

Fazer as seguintes instalações de dependências:

```bash
# Supabase
npm install @supabase/supabase-js

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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  gender VARCHAR(10),
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
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

No Supabase, ativar o login social nas configurações de autenticação, configurando as credenciais do OAuth para Google e Facebook. Após configurar, obtenha as credenciais de cliente (**Client ID** e **Client Secret**) e adicione-as em variáveis de ambiente no arquivo **.env.local**:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-google-client-id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=seu-google-client-secret
NEXT_PUBLIC_FACEBOOK_CLIENT_ID=seu-facebook-client-id
NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET=seu-facebook-client-secret
```

O arquivo _src/app/login/page.tsx_, deverá ter os botões para login social, os ícones e o redirecionamento com Supabase.

#### 4.3.1 Configurar OAuth no Google

**Passo a Passo:**

1. Acesse o console de desenvolvedor do Google: https://console.developers.google.com/.
2. Clique em **Select a project** e depois em **New Project** para criar um novo projeto.
3. Defina um nome para o projeto e clique em **Create**.
4. Com o projeto selecionado, vá até **OAuth consent screen** no menu lateral.
5. Em **User Type**, escolha **External** e clique em **Create**.
6. Preencha os detalhes da tela de consentimento, como nome do aplicativo, e-mail de contato e informações adicionais que deseja exibir aos usuários. Em seguida, clique em **Save and Continue**.
7. Após configurar a tela de consentimento, vá até **Credentials** no menu lateral e clique em **Create Credentials** > **OAuth client ID**.
8. Em **Application Type**, selecione **Web application**.
9. Defina um nome para as credenciais.
10. Em **Authorized redirect URIs**, adicione a URL de redirecionamento do Supabase: **_https://[SEU-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback_**. Substitua **_[YOUR-SUPABASE-PROJECT-REF]_** pelo ID do seu projeto Supabase.
11. Clique em **Create** e o Google irá gerar o **Client ID** e **Client Secret**.

**Variáveis de Ambiente:** Salve as credenciais no arquivo **.env.local**:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-google-client-id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

#### 4.3.2 Configurar OAuth no Facebook

**Passo a Passo:**

1. Acesse o Facebook for Developers: https://developers.facebook.com/.
2. Clique em **My Apps** no canto superior direito e depois em **Create App**.
3. Escolha **Consumer** e clique em **Next**.
4. Defina um nome para o aplicativo, informe seu e-mail de contato e clique em **Create App ID**.
5. No menu lateral, vá até **Settings** > **Basic** e preencha as informações adicionais do aplicativo.
6. No menu lateral, vá para **Products** e adicione o **Facebook Login** como produto.
7. Em **Client OAuth Settings**, configure o **Valid OAuth Redirect URIs** com a URL de redirecionamento do Supabase: **_https://[SEU-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback_**.
8. Salve as alterações.
9. Volte para **Settings** > **Basic** e copie o **App ID** e o **App Secret**.

**Variáveis de Ambiente:** Salve as credenciais no arquivo **.env.local**:

```bash
NEXT_PUBLIC_FACEBOOK_CLIENT_ID=seu-facebook-app-id NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET=seu-facebook-app-secret
```

#### 4.3.4 Configurar no Supabase

Após salvar as credenciais no arquivo **.env.local**, você precisa configurar as mesmas no painel do Supabase:

1. Acesse o painel do Supabase em https://app.supabase.io/.
2. Selecione o seu projeto.
3. Vá para **Authentication** > **Settings**.
4. Na seção **External OAuth Providers**, ative **Google** e **Facebook**.
5. Insira o **Client ID** e o **Client Secret** para cada provedor, usando os valores configurados.

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
