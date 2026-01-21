# 🔧 Configurar Variáveis de Ambiente na Vercel

## ❌ Erro Atual
```
Vercel Blob: No token found. Either configure the `BLOB_READ_WRITE_TOKEN` environment variable
```

## ✅ Solução: Configurar Blob Store na Vercel

### Passo 1: Criar Blob Store

1. Acesse o dashboard da Vercel: https://vercel.com/dashboard
2. No menu lateral, clique em **"Storage"**
3. Clique em **"Create Store"**
4. Escolha **"Blob Store"**
5. Dê um nome (ex: `gift-list-store`)
6. Escolha a região (recomendado: **São Paulo** se disponível)
7. Clique em **"Create"**

### Passo 2: Conectar o Projeto ao Blob Store

**IMPORTANTE:** Este passo é essencial! Ele injeta automaticamente a variável `BLOB_READ_WRITE_TOKEN`.

1. Na página do Blob Store criado, procure o botão **"Connect"** ou **"Link Project"**
2. Selecione o projeto **`gift-list-backend`**
3. Clique em **"Link"** ou **"Connect"**
4. Isso vai adicionar automaticamente a variável de ambiente `BLOB_READ_WRITE_TOKEN`

### Passo 3: Verificar Variáveis de Ambiente

1. Vá para o seu projeto na Vercel
2. Clique em **"Settings"** > **"Environment Variables"**
3. Verifique se existe `BLOB_READ_WRITE_TOKEN` listada
4. Se não existir, vá para o Passo 4

### Passo 4: Adicionar Manualmente (Se necessário)

Se o Passo 2 não funcionou automaticamente:

1. No dashboard do Blob Store, copie o **token** ou **Read/Write Token**
2. No projeto, vá em **Settings** > **Environment Variables**
3. Clique em **"Add New"**
4. Adicione:
   - **Key:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** Cole o token do Blob Store
   - **Environments:** Selecione todos (Production, Preview, Development)
5. Clique em **"Save"**

### Passo 5: Fazer Redeploy

Após adicionar a variável:

1. No projeto, vá na aba **"Deployments"**
2. Clique nos 3 pontos (⋯) do último deploy
3. Clique em **"Redeploy"**
4. Aguarde o deploy completar

OU simplesmente faça um novo commit no GitHub (se tiver CI/CD configurado).

## 🧪 Testar

Após o redeploy, teste a API:

```bash
curl https://gift-list-backend.vercel.app/api/gifts
```

Deve retornar a lista de gifts (pode estar vazia inicialmente).

## 📝 Verificar Token Localmente

Para testar localmente, você precisa do token:

1. No dashboard do Blob Store, copie o token
2. No arquivo `.env.local`, adicione:
   ```env
   BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
   ```

Ou execute:
```bash
vercel env pull .env.local
```

## ✅ Checklist

- [ ] Blob Store criado na Vercel
- [ ] Projeto conectado ao Blob Store
- [ ] Variável `BLOB_READ_WRITE_TOKEN` existe no projeto
- [ ] Redeploy feito após configurar
- [ ] API testada e funcionando

## 🆘 Se ainda não funcionar

1. Verifique se o nome da variável está exatamente: `BLOB_READ_WRITE_TOKEN`
2. Confirme que o token foi copiado completamente
3. Verifique se fez redeploy após adicionar a variável
4. Verifique os logs do deploy na Vercel para erros
