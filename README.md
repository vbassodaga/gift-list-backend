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

2. **Configurar variável de ambiente:**
   - Crie um arquivo `.env.local`
   - Adicione: `BLOB_READ_WRITE_TOKEN=seu_token_vercel`

   Para obter o token:
   - Acesse: https://vercel.com/dashboard
   - Vá em Settings > Storage > Create Store
   - Crie um Blob Store
   - Copie o token

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

2. **Configurar variáveis de ambiente:**
   - No dashboard da Vercel, vá em Settings > Environment Variables
   - Adicione: `BLOB_READ_WRITE_TOKEN` com o token do Blob Store

3. **Criar Blob Store:**
   - Vá em Storage > Create Store
   - Crie um novo Blob Store
   - Copie o token e adicione nas variáveis de ambiente

4. **Deploy automático:**
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
- Configure a variável de ambiente no Vercel
- Ou adicione no `.env.local` para desenvolvimento

### Erro de CORS
- Configure `AllowedOrigins` no frontend Angular
- Adicione a URL do frontend nas configurações
