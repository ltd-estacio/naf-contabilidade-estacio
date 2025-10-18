const fs = require('fs');

console.log('🔧 CORREÇÃO ULTRA ESPECÍFICA - Casos Restantes\n');

const specificFiles = [
  'src/app/page.tsx',
  'src/app/faq/page.tsx',
  'src/app/fiscal-guides/page.tsx',
  'src/app/monitor/page.tsx',
  'src/app/naf-management/page.tsx',
  'src/components/chat/ChatWidget.tsx',
  'src/components/chat/CoordinatorChat.tsx',
  'src/components/layout/NAFFooter.tsx'
];

function applyUltraSpecificFixes(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { modified: false, error: 'Arquivo não encontrado' };
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fixes = 0;

    // Array de correções muito específicas
    const ultraSpecificFixes = [
      // Para className="bg-white <resto>" que não tem dark:
      {
        regex: /className=(['"])([^'"]*?)bg-white(\s+[^'"]*?)\1(?![^<>]*?dark:bg-)/g,
        replacement: 'className=$1$2bg-white dark:bg-gray-950$3$1',
        desc: 'bg-white específico'
      },
      
      // Para className="bg-gray-50 <resto>" que não tem dark:
      {
        regex: /className=(['"])([^'"]*?)bg-gray-50(\s+[^'"]*?)\1(?![^<>]*?dark:bg-)/g,
        replacement: 'className=$1$2bg-gray-50 dark:bg-gray-900$3$1',
        desc: 'bg-gray-50 específico'
      },
      
      // Para className="bg-gray-100 <resto>" que não tem dark:
      {
        regex: /className=(['"])([^'"]*?)bg-gray-100(\s+[^'"]*?)\1(?![^<>]*?dark:bg-)/g,
        replacement: 'className=$1$2bg-gray-100 dark:bg-gray-800$3$1',
        desc: 'bg-gray-100 específico'
      },
      
      // Para casos onde bg-white está sozinho
      {
        regex: /className=(['"])bg-white\1(?![^<>]*?dark:bg-)/g,
        replacement: 'className=$1bg-white dark:bg-gray-950$1',
        desc: 'bg-white sozinho'
      },
      
      // Para casos onde bg-gray-50 está sozinho  
      {
        regex: /className=(['"])bg-gray-50\1(?![^<>]*?dark:bg-)/g,
        replacement: 'className=$1bg-gray-50 dark:bg-gray-900$1',
        desc: 'bg-gray-50 sozinho'
      },
      
      // Para casos onde bg-gray-100 está sozinho
      {
        regex: /className=(['"])bg-gray-100\1(?![^<>]*?dark:bg-)/g,
        replacement: 'className=$1bg-gray-100 dark:bg-gray-800$1',
        desc: 'bg-gray-100 sozinho'
      }
    ];

    ultraSpecificFixes.forEach(({ regex, replacement, desc }) => {
      const before = content;
      content = content.replace(regex, replacement);
      if (content !== before) {
        modified = true;
        fixes++;
        console.log(`   ✓ Aplicado: ${desc}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      return { modified: true, fixes };
    }
    
    return { modified: false, fixes: 0 };
  } catch (error) {
    return { modified: false, error: error.message };
  }
}

specificFiles.forEach(filePath => {
  console.log(`🔍 Processando: ${filePath}`);
  const result = applyUltraSpecificFixes(filePath);
  
  if (result.error) {
    console.log(`❌ Erro: ${result.error}`);
  } else if (result.modified) {
    console.log(`✅ ${result.fixes} correções aplicadas`);
  } else {
    console.log(`⚪ Nenhuma correção necessária`);
  }
  console.log('');
});

console.log('🎉 CORREÇÃO ULTRA ESPECÍFICA CONCLUÍDA!');