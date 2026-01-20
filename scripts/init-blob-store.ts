/**
 * Script para inicializar o Vercel Blob Storage vazio
 * Cria a estrutura inicial do banco de dados no Blob Storage
 * 
 * Execute: npm run init-blob
 */

import { put, list } from '@vercel/blob';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

// Verificar token do Blob Storage
const blobToken = process.env.BLOB_READ_WRITE_TOKEN || 
                  process.env.giftList_READ_WRITE_TOKEN ||
                  Object.entries(process.env).find(([key]) => key.endsWith('_READ_WRITE_TOKEN'))?.[1];

if (!blobToken) {
  console.error('❌ Token do Blob Storage não encontrado!');
  console.error('   Procure por uma variável que termine com _READ_WRITE_TOKEN');
  console.error('   Execute: vercel env pull .env.local');
  console.error('   Ou configure manualmente no .env.local');
  process.exit(1);
}

// Definir a variável para o SDK usar
process.env.BLOB_READ_WRITE_TOKEN = blobToken;

async function checkExistingData() {
  console.log('🔍 Verificando dados existentes...\n');
  
  try {
    const [giftsResult, usersResult] = await Promise.all([
      list({ prefix: 'gifts/', limit: 1000 }),
      list({ prefix: 'users/', limit: 1000 })
    ]);

    const giftsCount = giftsResult.blobs.length;
    const usersCount = usersResult.blobs.length;

    console.log(`📦 Gifts existentes: ${giftsCount}`);
    console.log(`👥 Usuários existentes: ${usersCount}\n`);

    if (giftsCount > 0 || usersCount > 0) {
      console.log('⚠️  ATENÇÃO: Já existem dados no Blob Storage!');
      console.log('   A inicialização não será executada para evitar sobrescrever dados existentes.\n');
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Erro ao verificar blobs:', error.message);
    return true; // Continuar mesmo com erro
  }
}

async function createAdminUser() {
  console.log('👤 Criando usuário admin inicial...\n');

  try {
    // Importar bcrypt para hash da senha
    const bcrypt = await import('bcryptjs');
    const bcryptjs = bcrypt.default || bcrypt;
    
    const adminPassword = 'admin123'; // Senha padrão do admin
    const passwordHash = await bcryptjs.hash(adminPassword, 10);

    const adminUser = {
      id: 1,
      firstName: 'Admin',
      lastName: 'Sistema',
      phoneNumber: '11999999999',
      passwordHash: passwordHash,
      role: 1, // Admin
      createdAt: new Date().toISOString()
    };

    await put('users/1.json', JSON.stringify(adminUser), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json'
    });

    // Criar índice para busca por telefone
    await put('index/phone/11999999999.json', JSON.stringify({ userId: 1 }), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json'
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('   Telefone: 11999999999');
    console.log('   Senha: admin123');
    console.log('   ⚠️  ALTERE A SENHA APÓS O PRIMEIRO LOGIN!\n');
    
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao criar usuário admin:', error.message);
    return false;
  }
}

async function createSampleGift() {
  console.log('🎁 Criando presente de exemplo...\n');

  try {
    const sampleGift = {
      id: 1,
      name: 'Presente de Exemplo',
      description: 'Este é um presente de exemplo. Você pode editá-lo ou deletá-lo.',
      imageUrl: 'https://via.placeholder.com/400x300?text=Presente+de+Exemplo',
      isPurchased: false,
      purchasedByUserId: null,
      createdAt: new Date().toISOString()
    };

    await put('gifts/1.json', JSON.stringify(sampleGift), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json'
    });

    console.log('✅ Presente de exemplo criado!\n');
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao criar presente de exemplo:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando inicialização do Vercel Blob Storage\n');
  console.log('═══════════════════════════════════════════════\n');

  // Verificar dados existentes
  const canProceed = await checkExistingData();
  if (!canProceed) {
    console.log('❌ Inicialização cancelada.');
    console.log('   Para recriar do zero, delete os blobs existentes manualmente na Vercel.');
    process.exit(1);
  }

  console.log('✅ Blob Storage está vazio. Iniciando criação...\n');
  console.log('═══════════════════════════════════════════════\n');

  try {
    // Criar usuário admin
    const adminCreated = await createAdminUser();
    if (!adminCreated) {
      throw new Error('Falha ao criar usuário admin');
    }

    // Criar presente de exemplo (opcional)
    const createSample = process.env.CREATE_SAMPLE_GIFT !== 'false';
    if (createSample) {
      await createSampleGift();
    }

    console.log('═══════════════════════════════════════════════');
    console.log('✅ Inicialização concluída com sucesso!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('   1. Faça login com o usuário admin criado');
    console.log('   2. Altere a senha padrão');
    console.log('   3. Comece a adicionar presentes');
    console.log('');
    console.log('🎉 Seu Blob Storage está pronto para uso!');
    console.log('═══════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('\n❌ Erro durante a inicialização:', error.message);
    process.exit(1);
  }
}

// Executar
main();
