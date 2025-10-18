#!/usr/bin/env node

/**
 * Script para corrigir problemas de build e fazer deploy
 */

const fs = require('fs');
const path = require('path');

// Lista de páginas que estão causando problemas
const problematicPages = [
  'src/app/dashboard/page.tsx',
  'src/app/services/page.tsx',
  'src/app/guides/page.tsx',
  'src/app/monitor/page.tsx',
  'src/app/test/page.tsx',
  'src/app/schedule/page.tsx',
  'src/app/about-naf/page.tsx',
  'src/app/services/manage/page.tsx',
  'src/app/naf-services/page.tsx',
  'src/app/test-schedule/page.tsx'
];

console.log('🔧 Corrigindo problemas de build...');

problematicPages.forEach(pagePath => {
  const fullPath = path.join(process.cwd(), pagePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`📝 Corrigindo: ${pagePath}`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Remove dynamic exports que causam problemas
    content = content.replace(/export const dynamic = ['"](force-dynamic|auto)['"];?\n?/g, '');
    
    // Remove revalidate exports
    content = content.replace(/export const revalidate = \d+;?\n?/g, '');
    
    // Remove runtime exports
    content = content.replace(/export const runtime = ['"][^'"]+['"];?\n?/g, '');
    
    // Adiciona 'use client' se necessário para componentes com hooks
    if (content.includes('useState') || content.includes('useEffect') || content.includes('useRouter')) {
      if (!content.includes("'use client'")) {
        content = "'use client';\n\n" + content;
      }
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Corrigido: ${pagePath}`);
  }
});

console.log('✅ Correções aplicadas com sucesso!');
