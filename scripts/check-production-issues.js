#!/usr/bin/env node

/**
 * Script para identificar problemas potenciais em produção
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando problemas potenciais em produção...\n');

// 1. Verificar se variáveis de ambiente essenciais estão nos arquivos
const checkEnvFiles = () => {
  console.log('📁 1. Verificando arquivos de ambiente...');

  const envFiles = ['.env.production', '.env.netlify'];
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_BASE_URL',
    'NEXTAUTH_URL'
  ];

  envFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      console.log(`  ✅ ${file} existe`);

      requiredVars.forEach(varName => {
        if (content.includes(varName)) {
          console.log(`    ✅ ${varName} encontrado`);
        } else {
          console.log(`    ❌ ${varName} FALTANDO`);
        }
      });
    } catch (error) {
      console.log(`  ❌ ${file} não encontrado`);
    }
  });
};

// 2. Verificar URLs hardcoded
const checkHardcodedUrls = () => {
  console.log('\n🔗 2. Verificando URLs hardcoded...');

  const srcDir = 'src';
  const problematicPatterns = [
    'localhost:4000',
    'localhost:3000',
    'http://localhost',
    'https://localhost'
  ];

  function searchInDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        searchInDirectory(fullPath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(fullPath, 'utf8');

        problematicPatterns.forEach(pattern => {
          if (content.includes(pattern)) {
            console.log(`  ⚠️  ${pattern} encontrado em: ${fullPath}`);
          }
        });
      }
    });
  }

  if (fs.existsSync(srcDir)) {
    searchInDirectory(srcDir);
    console.log('  ✅ Verificação de URLs concluída');
  }
};

// 3. Verificar dependências críticas
const checkCriticalDeps = () => {
  console.log('\n📦 3. Verificando dependências críticas...');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const criticalDeps = [
      '@supabase/supabase-js',
      'next',
      'react',
      'lucide-react'
    ];

    criticalDeps.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        console.log(`  ❌ ${dep} FALTANDO`);
      }
    });
  } catch (error) {
    console.log('  ❌ Erro ao ler package.json');
  }
};

// 4. Verificar se APIs críticas existem
const checkCriticalApis = () => {
  console.log('\n🔌 4. Verificando APIs críticas...');

  const criticalApis = [
    'src/app/api/chat/conversations/route.ts',
    'src/app/api/chat/messages/route.ts',
    'src/app/api/chat/ai/route.ts',
    'src/app/api/chat/human-request/route.ts',
    'src/app/api/legislation/route.ts',
    'src/app/api/stats/route.ts'
  ];

  criticalApis.forEach(api => {
    if (fs.existsSync(api)) {
      console.log(`  ✅ ${api}`);
    } else {
      console.log(`  ❌ ${api} FALTANDO`);
    }
  });
};

// Executar todas as verificações
checkEnvFiles();
checkHardcodedUrls();
checkCriticalDeps();
checkCriticalApis();

console.log('\n✅ Verificação concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Corrigir qualquer ❌ encontrado acima');
console.log('2. Adicionar variáveis de ambiente no Netlify');
console.log('3. Fazer deploy e testar o chat');
console.log('4. Verificar logs do Netlify se houver problemas');