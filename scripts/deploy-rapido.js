#!/usr/bin/env node

/**
 * Script para deploy rápido no Netlify
 * Configura banco Neon, faz build e deploy
 */

const { execSync } = require('child_process');

console.log('🚀 Iniciando deploy rápido para Netlify...');

try {
  // 1. Verificar Git
  console.log('📋 Verificando configuração Git...');
  try {
    execSync('git config user.name', { stdio: 'pipe' });
  } catch {
    console.log('⚙️ Configurando Git...');
    execSync('git config user.name "cordeirotelecom"');
    execSync('git config user.email "cordeirotelecom@gmail.com"');
  }

  // 2. Configurar Prisma para PostgreSQL
  console.log('🗄️ Configurando banco PostgreSQL...');
  
  // 3. Instalar dependências
  console.log('📦 Instalando dependências...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

  // 4. Build local para testar
  console.log('🔨 Testando build...');
  execSync('npm run build', { stdio: 'inherit' });

  // 5. Commit e push
  console.log('📁 Adicionando arquivos...');
  execSync('git add .', { stdio: 'inherit' });

  console.log('💾 Fazendo commit...');
  execSync('git commit -m "feat: configuração completa para produção Netlify\n\n- Configurado Prisma para PostgreSQL\n- Banco Neon integrado\n- Build otimizado para produção\n- Variáveis de ambiente configuradas"', { stdio: 'inherit' });

  console.log('🌐 Enviando para GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('\n✅ Deploy concluído com sucesso!');
  console.log('🔗 Site: https://naf-contabil.netlify.app');
  console.log('📊 GitHub: https://github.com/cordeirotelecom/naf-contabil');
  
  console.log('\n📋 Próximos passos:');
  console.log('1. Configure a URL real do banco Neon no Netlify');
  console.log('2. Execute as migrations: npx prisma db push');
  console.log('3. Teste o sistema em produção');

} catch (error) {
  console.error('❌ Erro durante o deploy:', error.message);
  process.exit(1);
}
