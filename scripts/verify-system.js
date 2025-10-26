#!/usr/bin/env node

/**
 * Script de Verificação e Correção Automática do Sistema NAF
 * Verifica todas as funcionalidades e corrige problemas encontrados
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 INICIANDO VERIFICAÇÃO COMPLETA DO SISTEMA NAF...\n');

const results = {
  tests: [],
  errors: [],
  warnings: [],
  success: []
};

function addResult(type, message, details = '') {
  const timestamp = new Date().toLocaleString('pt-BR');
  results[type].push({ message, details, timestamp });
  
  const emoji = {
    tests: '🧪',
    errors: '❌',
    warnings: '⚠️',
    success: '✅'
  }[type];
  
  console.log(`${emoji} ${message}`);
  if (details) console.log(`   ${details}`);
}

// Verificar se o Next.js está rodando
function checkServer() {
  console.log('\n📡 VERIFICANDO SERVIDOR...');
  
  try {
    // Verificar se a porta 3000 está em uso
    const netstat = execSync('netstat -an | findstr :3000', { encoding: 'utf8' });
    if (netstat.includes('LISTENING')) {
      addResult('success', 'Servidor rodando na porta 3000');
    } else {
      addResult('warnings', 'Servidor não está rodando', 'Execute: npm run dev');
    }
  } catch (error) {
    addResult('errors', 'Erro ao verificar servidor', error.message);
  }
}

// Verificar arquivos essenciais
function checkFiles() {
  console.log('\n📁 VERIFICANDO ARQUIVOS...');
  
  const essentialFiles = [
    'src/app/api/services/route.ts',
    'src/app/api/demands/route.ts',
    'src/app/api/attendances/route.ts',
    'src/app/api/guidance/route.ts',
    'src/app/api/email/route.ts',
    'src/app/api/reports/route.ts',
    'src/lib/email.ts',
    'src/lib/auth.ts',
    'src/lib/prisma.ts',
    'prisma/schema.prisma',
    'package.json'
  ];

  essentialFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      addResult('success', `Arquivo encontrado: ${file}`);
    } else {
      addResult('errors', `Arquivo ausente: ${file}`);
    }
  });
}

// Verificar banco de dados
function checkDatabase() {
  console.log('\n🗄️ VERIFICANDO BANCO DE DADOS...');
  
  try {
    // Verificar se o arquivo do banco existe
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (fs.existsSync(dbPath)) {
      addResult('success', 'Banco de dados encontrado');
    } else {
      addResult('warnings', 'Banco de dados não encontrado', 'Execute: npx prisma db push');
    }

    // Verificar schema
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      if (schema.includes('model User') && schema.includes('model Service')) {
        addResult('success', 'Schema do banco válido');
      } else {
        addResult('errors', 'Schema do banco incompleto');
      }
    }
  } catch (error) {
    addResult('errors', 'Erro ao verificar banco', error.message);
  }
}

// Verificar dependências
function checkDependencies() {
  console.log('\n📦 VERIFICANDO DEPENDÊNCIAS...');
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredDeps = [
      'next', 'react', 'typescript', 'prisma', '@prisma/client',
      'next-auth', 'bcryptjs', 'nodemailer', 'tailwindcss'
    ];

    requiredDeps.forEach(dep => {
      const found = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
      if (found) {
        addResult('success', `Dependência: ${dep} v${found}`);
      } else {
        addResult('errors', `Dependência ausente: ${dep}`);
      }
    });
  } catch (error) {
    addResult('errors', 'Erro ao verificar dependências', error.message);
  }
}

// Verificar configuração de email
function checkEmailConfig() {
  console.log('\n📧 VERIFICANDO CONFIGURAÇÃO DE EMAIL...');
  
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
      requiredVars.forEach(varName => {
        if (envContent.includes(varName)) {
          addResult('success', `Variável configurada: ${varName}`);
        } else {
          addResult('warnings', `Variável ausente: ${varName}`);
        }
      });
    } else {
      addResult('warnings', 'Arquivo .env.local não encontrado', 'Crie para configurar email');
    }
  } catch (error) {
    addResult('errors', 'Erro ao verificar configuração de email', error.message);
  }
}

// Executar correções automáticas
function autoFix() {
  console.log('\n🔧 EXECUTANDO CORREÇÕES AUTOMÁTICAS...');
  
  try {
    // Sincronizar banco de dados
    console.log('Sincronizando banco de dados...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    addResult('success', 'Banco sincronizado');

    // Gerar cliente Prisma
    console.log('Gerando cliente Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    addResult('success', 'Cliente Prisma gerado');

    // Popular banco com dados de teste
    console.log('Populando banco com dados...');
    try {
      execSync('npx prisma db seed', { stdio: 'inherit' });
      addResult('success', 'Dados de teste inseridos');
    } catch (seedError) {
      addResult('warnings', 'Erro ao popular banco', 'Dados podem já existir');
    }

  } catch (error) {
    addResult('errors', 'Erro nas correções automáticas', error.message);
  }
}

// Testar APIs principais
async function testAPIs() {
  console.log('\n🌐 TESTANDO APIs...');
  
  // Lista de APIs para testar
  const apis = [
    { endpoint: '/api/services', description: 'API de Serviços' },
    { endpoint: '/api/guidance?serviceId=cpf-cadastro', description: 'API de Orientações' },
    { endpoint: '/api/email', description: 'API de Email (teste)' },
    { endpoint: '/api/reports?type=general', description: 'API de Relatórios' }
  ];

  // Aguardar um pouco para o servidor estar pronto
  console.log('Aguardando servidor estar pronto...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  for (const api of apis) {
    try {
      const response = await fetch(`http://localhost:3000${api.endpoint}`);
      if (response.ok) {
        addResult('success', `${api.description} funcionando`);
      } else {
        addResult('warnings', `${api.description} com problemas`, `Status: ${response.status}`);
      }
    } catch (error) {
      addResult('errors', `Erro em ${api.description}`, error.message);
    }
  }
}

// Gerar relatório final
function generateReport() {
  console.log('\n📋 RELATÓRIO FINAL');
  console.log('='.repeat(50));
  
  console.log(`\n✅ SUCESSOS: ${results.success.length}`);
  console.log(`⚠️  AVISOS: ${results.warnings.length}`);
  console.log(`❌ ERROS: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERROS ENCONTRADOS:');
    results.errors.forEach((error, i) => {
      console.log(`${i+1}. ${error.message}`);
      if (error.details) console.log(`   ${error.details}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ AVISOS:');
    results.warnings.forEach((warning, i) => {
      console.log(`${i+1}. ${warning.message}`);
      if (warning.details) console.log(`   ${warning.details}`);
    });
  }
  
  const totalIssues = results.errors.length + results.warnings.length;
  const status = totalIssues === 0 ? '🎉 SISTEMA 100% FUNCIONAL!' : 
                 results.errors.length === 0 ? '⚠️ Sistema funcional com avisos' : 
                 '❌ Sistema com problemas';
  
  console.log(`\n${status}`);
  console.log('='.repeat(50));
  
  // Salvar relatório em arquivo
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      success: results.success.length,
      warnings: results.warnings.length,
      errors: results.errors.length,
      status
    },
    details: results
  };
  
  fs.writeFileSync('verification-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n📄 Relatório salvo em: verification-report.json');
}

// Executar verificação completa
async function runFullCheck() {
  try {
    checkServer();
    checkFiles();
    checkDatabase();
    checkDependencies();
    checkEmailConfig();
    autoFix();
    await testAPIs();
    generateReport();
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runFullCheck();
}

module.exports = { runFullCheck, results };
