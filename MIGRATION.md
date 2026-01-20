# 🔄 Guia de Migração: SQL Server → Vercel Blob Storage

Este guia explica como migrar seus dados do SQL Server para o Vercel Blob Storage.

## 📋 Pré-requisitos

1. Node.js 18+ instalado
2. Acesso ao banco de dados SQL Server
3. Projeto conectado ao Vercel Blob Store
4. Variáveis de ambiente configuradas

## 🚀 Passo a Passo

### 1. Instalar Dependências

```bash
cd gift-list-backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env.local`:

```env
# Vercel Blob Storage (obtido automaticamente após conectar ao Blob Store)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx

# SQL Server (ajuste conforme seu ambiente)
SQL_SERVER=localhost
SQL_PORT=1433
SQL_USER=sa
SQL_PASSWORD=sua_senha
SQL_DATABASE=HousewarmingRegistry
```

**Ou baixe as variáveis da Vercel:**
```bash
vercel env pull .env.local
```

E adicione manualmente as variáveis do SQL Server.

### 3. Executar Migração

```bash
npm run migrate
```

O script irá:
- ✅ Conectar ao SQL Server
- ✅ Buscar todos os gifts e users
- ✅ Fazer upload para o Vercel Blob Storage
- ✅ Criar índices para busca por telefone

### 4. Verificar Resultado

Após a migração, você verá:
```
✅ X gifts migrados com sucesso!
✅ X usuários migrados com sucesso!
🎉 Seus dados estão agora no Vercel Blob Storage
```

## 📊 Estrutura dos Dados Migrados

### Gifts
- **Caminho:** `gifts/{id}.json`
- **Formato:**
```json
{
  "id": 1,
  "name": "Presente 1",
  "description": "Descrição",
  "imageUrl": "https://...",
  "isPurchased": false,
  "purchasedByUserId": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Users
- **Caminho:** `users/{id}.json`
- **Formato:**
```json
{
  "id": 1,
  "firstName": "João",
  "lastName": "Silva",
  "phoneNumber": "11999999999",
  "passwordHash": "$2a$10$...",
  "role": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Índices
- **Caminho:** `index/phone/{phoneNumber}.json`
- **Formato:**
```json
{
  "userId": 1
}
```

## ⚠️ Avisos Importantes

1. **Backup:** Faça backup do SQL Server antes da migração
2. **Dados existentes:** O script verifica se já existem dados no Blob Storage
3. **Senhas:** As senhas (hashes) são migradas como estão - não serão rehasheadas
4. **IDs:** Os IDs numéricos são preservados

## 🔍 Verificar Dados Migrados

Após a migração, você pode verificar os dados diretamente na API:

```bash
# Testar endpoint de gifts
curl https://seu-projeto.vercel.app/api/gifts

# Testar endpoint de usuários
curl https://seu-projeto.vercel.app/api/users/1
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to SQL Server"
- Verifique se o SQL Server está rodando
- Confirme as credenciais no `.env.local`
- Teste a conexão com outra ferramenta (SSMS, Azure Data Studio)

### Erro: "BLOB_READ_WRITE_TOKEN not configured"
- Execute: `vercel env pull .env.local`
- Ou adicione manualmente no `.env.local`

### Erro: "Database does not exist"
- Verifique o nome do banco em `SQL_DATABASE`
- Confirme que o banco existe no SQL Server

### Dados não aparecem após migração
- Verifique os logs do script para erros
- Confirme que o projeto está conectado ao Blob Store correto
- Teste acessando a API diretamente

## 📝 Exemplo de Uso Completo

```bash
# 1. Navegar para a pasta
cd gift-list-backend

# 2. Instalar dependências
npm install

# 3. Configurar variáveis
vercel env pull .env.local
# Editar .env.local e adicionar SQL_SERVER, SQL_USER, etc.

# 4. Executar migração
npm run migrate

# 5. Testar API
curl http://localhost:3000/api/gifts
```

## 🎯 Próximos Passos

Após a migração bem-sucedida:

1. ✅ Teste todos os endpoints da API
2. ✅ Verifique se o frontend Angular está funcionando
3. ✅ Confirme que os usuários conseguem fazer login
4. ✅ Valide que os dados estão corretos

## 💡 Dica

Se precisar fazer a migração novamente (por exemplo, após corrigir dados):
- O script detecta dados existentes e avisa
- Para sobrescrever, você precisaria deletar os blobs existentes manualmente
- Ou modificar o script para permitir sobrescrita
