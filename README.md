# Gift List Backend - Next.js + Vercel Blob

Backend API para o Gift List App usando Next.js API Routes e Vercel Blob Storage.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com API Routes
- **Vercel Blob Storage** - Armazenamento de dados (gratuito)
- **TypeScript** - Tipagem estática
- **bcryptjs** - Hash de senhas

## 📋 Pré-requisitos

1. Conta na Vercel (grátis)
2. Node.js 18+ instalado
3. NPM ou Yarn

## 🔧 Configuração Local

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Conectar ao Blob Store na Vercel:**
   - Acesse: https://vercel.com/dashboard
   - Vá em Storage > Create Store (se ainda não criou)
   - Crie um Blob Store
   - Conecte o projeto ao Blob Store (isso injeta automaticamente `BLOB_READ_WRITE_TOKEN`)

3. **Configurar localmente:**
   ```bash
   # Instalar Vercel CLI (se ainda não tem)
   npm i -g vercel
   
   # Conectar projeto local ao projeto Vercel
   vercel link
   
   # Baixar variáveis de ambiente
   vercel env pull .env.local
   ```

3. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```

   A API estará disponível em: `http://localhost:3000/api`

## 🌐 Endpoints

### Gifts
- `GET /api/gifts` - Lista todos os presentes
- `GET /api/gifts/[id]` - Obter presente específico
- `POST /api/gifts?userId=X` - Criar presente (admin)
- `PUT /api/gifts/[id]?userId=X` - Atualizar presente (admin)
- `DELETE /api/gifts/[id]?userId=X` - Deletar presente (admin)
- `POST /api/gifts/[id]/purchase` - Marcar como comprado
- `POST /api/gifts/[id]/unpurchase?userId=X` - Desmarcar comprado

### Users
- `POST /api/users/register` - Registrar usuário
- `POST /api/users/login` - Login
- `GET /api/users/[id]` - Obter usuário

## 🚀 Deploy na Vercel

1. **Conectar repositório:**
   - Acesse: https://vercel.com/new
   - Conecte seu repositório GitHub
   - Selecione a pasta `gift-list-backend`

2. **Criar e conectar Blob Store:**
   - No dashboard da Vercel, vá em Storage
   - Clique em "Create Store" e crie um Blob Store
   - **IMPORTANTE:** Conecte o projeto ao Blob Store
   - Isso injeta automaticamente a variável `BLOB_READ_WRITE_TOKEN`

3. **Deploy automático:**
   - A Vercel fará deploy automaticamente
   - Sua API estará em: `https://seu-projeto.vercel.app/api`

## 🔗 Integração com Angular

O frontend Angular pode consumir esta API normalmente. Configure:

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://seu-projeto.vercel.app/api'
};
```

## 📝 Notas

- Vercel Blob Storage tem 256MB grátis
- Perfeito para projetos pequenos/médios
- Dados são armazenados como JSON em blobs
- Não há banco de dados relacional (usamos blobs como key-value store)

## 🆘 Troubleshooting

### Erro: "BLOB_READ_WRITE_TOKEN is not defined"
- **Conecte o projeto ao Blob Store** na Vercel (isso injeta automaticamente o token)
- Para desenvolvimento local: execute `vercel env pull .env.local`

### Erro de CORS
- Configure `AllowedOrigins` no frontend Angular
- Adicione a URL do frontend nas configurações
