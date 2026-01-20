/**
 * Script para migrar dados do SQL Server para Vercel Blob Storage
 * 
 * Uso:
 * 1. Configure a connection string do SQL Server no .env.local
 * 2. Configure BLOB_READ_WRITE_TOKEN no .env.local
 * 3. Execute: npx ts-node scripts/migrate-sql-to-blob.ts
 */

import { put, list } from '@vercel/blob';
import * as mssql from 'mssql';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // Também carregar .env se existir

interface Gift {
  Id: number;
  Name: string;
  Description: string;
  ImageUrl: string;
  IsPurchased: boolean;
  PurchasedByUserId: number | null;
  CreatedAt: Date;
}

interface User {
  Id: number;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  PasswordHash: string;
  Role: number; // 0 = SimpleUser, 1 = Admin
  CreatedAt: Date;
}

// Configuração do SQL Server - Usando a mesma connection string do projeto .NET
// Connection string do .NET: Server=.;Database=HousewarmingRegistry;User ID=sa;Password=limite66;MultipleActiveResultSets=true;TrustServerCertificate=True
// No Node.js, "." pode não funcionar, então tentamos variações
const getConnectionConfig = () => {
  const server = process.env.SQL_SERVER || '.';
  const database = process.env.SQL_DATABASE || 'HousewarmingRegistry';
  const user = process.env.SQL_USER || 'sa';
  const password = process.env.SQL_PASSWORD || 'limite66';
  
  // Tentar diferentes formas de conectar
  // Se server for ".", tentar (local) primeiro, depois localhost\SQLEXPRESS
  let finalServer = server;
  if (server === '.') {
    // Tentar (local) que funciona melhor no Node.js
    finalServer = '(local)';
  }
  
  return {
    connectionString: `Server=${finalServer};Database=${database};User ID=${user};Password=${password};TrustServerCertificate=True;MultipleActiveResultSets=true`,
    config: {
      server: finalServer === '(local)' ? 'localhost' : finalServer,
      database,
      user,
      password,
      options: {
        encrypt: false, // LocalDB geralmente não precisa encrypt
        trustServerCertificate: true,
        enableArithAbort: true,
        instanceName: finalServer === '(local)' ? undefined : undefined,
      },
    }
  };
};

const { connectionString, config } = getConnectionConfig();

// Helper para obter chave do blob
function getKey(prefix: string, id: number): string {
  return `${prefix}/${id}.json`;
}

// Migrar Gifts
async function migrateGifts() {
  console.log('🔄 Conectando ao SQL Server...');
  
  try {
    // Reutilizar conexão anterior ou criar nova
    if (!mssql.globalConnection || !mssql.globalConnection.connected) {
      await mssql.connect(config).catch(async () => {
        await mssql.connect(connectionString);
      });
    }
    console.log('✅ Conectado ao SQL Server');

    console.log('📦 Buscando gifts...');
    const giftsResult = await mssql.query<Gift>`
      SELECT Id, Name, Description, ImageUrl, IsPurchased, PurchasedByUserId, CreatedAt
      FROM Gifts
      ORDER BY Id
    `;

    const gifts = giftsResult.recordset;
    console.log(`📋 Encontrados ${gifts.length} gifts`);

    console.log('☁️  Fazendo upload para Vercel Blob Storage...');
    
    for (const gift of gifts) {
      const key = getKey('gifts', gift.Id);
      
      const giftData = {
        id: gift.Id,
        name: gift.Name,
        description: gift.Description || '',
        imageUrl: gift.ImageUrl || '',
        isPurchased: gift.IsPurchased,
        purchasedByUserId: gift.PurchasedByUserId || null,
        createdAt: gift.CreatedAt.toISOString()
      };

      await put(key, JSON.stringify(giftData), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json'
      });

      console.log(`  ✓ Gift ${gift.Id} migrado`);
    }

    console.log(`✅ ${gifts.length} gifts migrados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao migrar gifts:', error);
    throw error;
  } finally {
    await mssql.close();
  }
}

// Migrar Users
async function migrateUsers() {
  console.log('🔄 Conectando ao SQL Server...');
  console.log(`   Tentando: Server=${config.server}, Database=${config.database}`);
  
  try {
    // Tentar primeiro com config object, se falhar, tentar connection string
    await mssql.connect(config).catch(async () => {
      console.log('   Tentando com connection string...');
      await mssql.connect(connectionString);
    });
    console.log('✅ Conectado ao SQL Server');

    console.log('👥 Buscando usuários...');
    const usersResult = await mssql.query<User>`
      SELECT Id, FirstName, LastName, PhoneNumber, PasswordHash, Role, CreatedAt
      FROM Users
      ORDER BY Id
    `;

    const users = usersResult.recordset;
    console.log(`📋 Encontrados ${users.length} usuários`);

    console.log('☁️  Fazendo upload para Vercel Blob Storage...');
    
    for (const user of users) {
      const key = getKey('users', user.Id);
      
      const userData = {
        id: user.Id,
        firstName: user.FirstName,
        lastName: user.LastName,
        phoneNumber: user.PhoneNumber,
        passwordHash: user.PasswordHash,
        role: user.Role, // 0 = SimpleUser, 1 = Admin
        createdAt: user.CreatedAt.toISOString()
      };

      await put(key, JSON.stringify(userData), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json'
      });

      // Criar índice para busca por telefone
      const phoneIndexKey = `index/phone/${user.PhoneNumber}.json`;
      await put(phoneIndexKey, JSON.stringify({ userId: user.Id }), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json'
      });

      console.log(`  ✓ Usuário ${user.Id} migrado (${user.PhoneNumber})`);
    }

    console.log(`✅ ${users.length} usuários migrados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao migrar usuários:', error);
    throw error;
  } finally {
    await mssql.close();
  }
}

// Verificar blobs existentes
async function checkExistingBlobs() {
  console.log('🔍 Verificando blobs existentes...');
  
  try {
    const [giftsResult, usersResult] = await Promise.all([
      list({ prefix: 'gifts/', limit: 1000 }),
      list({ prefix: 'users/', limit: 1000 })
    ]);

    console.log(`📦 Gifts existentes: ${giftsResult.blobs.length}`);
    console.log(`👥 Usuários existentes: ${usersResult.blobs.length}`);

    if (giftsResult.blobs.length > 0 || usersResult.blobs.length > 0) {
      console.log('⚠️  ATENÇÃO: Já existem dados no Blob Storage!');
      console.log('   A migração pode sobrescrever dados existentes.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao verificar blobs:', error);
    return true; // Continuar mesmo com erro
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando migração SQL Server → Vercel Blob Storage\n');

  // Verificar variável de ambiente (pode ter diferentes nomes dependendo do Blob Store)
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

  // Verificar dados existentes
  const shouldContinue = await checkExistingBlobs();
  if (!shouldContinue) {
    console.log('\n❌ Migração cancelada. Limpe os dados existentes primeiro.');
    process.exit(1);
  }

  try {
    // Migrar dados
    await migrateUsers();
    console.log('');
    await migrateGifts();

    console.log('\n✅ Migração concluída com sucesso!');
    console.log('🎉 Seus dados estão agora no Vercel Blob Storage');
  } catch (error) {
    console.error('\n❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar
main();
