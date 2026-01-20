/**
 * Script de teste para verificar conexão com SQL Server
 * Execute: npx tsx scripts/test-connection.ts
 */

import * as mssql from 'mssql';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const testConnections = [
  {
    name: 'Server=. (Original .NET)',
    config: {
      server: '(local)',
      database: 'HousewarmingRegistry',
      user: 'sa',
      password: 'limite66',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
    }
  },
  {
    name: 'localhost:1433',
    config: {
      server: 'localhost',
      database: 'HousewarmingRegistry',
      user: 'sa',
      password: 'limite66',
      options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
      port: 1433,
    }
  },
  {
    name: 'localhost\\SQLEXPRESS',
    config: {
      server: 'localhost',
      database: 'HousewarmingRegistry',
      user: 'sa',
      password: 'limite66',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        instanceName: 'SQLEXPRESS',
      },
    }
  },
];

async function testConnection(name: string, config: any) {
  try {
    console.log(`\n🔄 Testando: ${name}`);
    const pool = await mssql.connect(config);
    const result = await pool.request().query('SELECT @@VERSION AS Version');
    console.log(`✅ SUCESSO! Versão do SQL Server:`);
    console.log(`   ${result.recordset[0].Version.split('\n')[0]}`);
    await pool.close();
    return true;
  } catch (error: any) {
    console.log(`❌ Falhou: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Testando conexões com SQL Server...\n');
  console.log('Tentando diferentes configurações...\n');

  for (const conn of testConnections) {
    const success = await testConnection(conn.name, conn.config);
    if (success) {
      console.log(`\n✅ USE ESTA CONFIGURAÇÃO: ${conn.name}`);
      console.log(JSON.stringify(conn.config, null, 2));
      break;
    }
  }
}

main().catch(console.error);
