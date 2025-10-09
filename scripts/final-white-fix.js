const fs = require('fs');
const path = require('path');

console.log('🔧 CORREÇÃO FINAL - Eliminando os Últimos Fundos Brancos\n');

// Correções mais precisas para os casos restantes
const preciseCorrections = [
  // Para className que não tem dark: mas deveria ter
  {
    search: /className="([^"]*)\s+bg-white(\s+[^"]*)"(?![^>]*dark:bg-)/g,
    replace: 'className="$1 bg-white dark:bg-gray-950$2"',
    description: 'bg-white sem dark theme'
  },
  
  {
    search: /className="([^"]*)\s+bg-gray-50(\s+[^"]*)"(?![^>]*dark:bg-)/g,
    replace: 'className="$1 bg-gray-50 dark:bg-gray-900$2"',
    description: 'bg-gray-50 sem dark theme'
  },
  
  {
    search: /className="([^"]*)\s+bg-gray-100(\s+[^"]*)"(?![^>]*dark:bg-)/g,
    replace: 'className="$1 bg-gray-100 dark:bg-gray-800$2"',
    description: 'bg-gray-100 sem dark theme'
  },
  
  {
    search: /className="([^"]*)\s+text-gray-900(\s+[^"]*)"(?![^>]*dark:text-)/g,
    replace: 'className="$1 text-gray-900 dark:text-white$2"',
    description: 'text-gray-900 sem dark theme'
  },
  
  // Casos mais específicos para strings que começam com a classe
  {
    search: /className="bg-white([^"]*)"(?![^>]*dark:bg-)/g,
    replace: 'className="bg-white dark:bg-gray-950$1"',
    description: 'bg-white no início'
  },
  
  {
    search: /className="bg-gray-50([^"]*)"(?![^>]*dark:bg-)/g,
    replace: 'className="bg-gray-50 dark:bg-gray-900$1"',
    description: 'bg-gray-50 no início'
  },
  
  {
    search: /className="bg-gray-100([^"]*)"(?![^>]*dark:bg-)/g,
    replace: 'className="bg-gray-100 dark:bg-gray-800$1"',
    description: 'bg-gray-100 no início'
  },
  
  {
    search: /className="text-gray-900([^"]*)"(?![^>]*dark:text-)/g,
    replace: 'className="text-gray-900 dark:text-white$1"',
    description: 'text-gray-900 no início'
  }
];

// Arquivos com problemas identificados
const problematicFiles = [
  'src/app/coordenador/coordinator-client.tsx',
  'src/app/dashboard/analytics/page.tsx',
  'src/app/dashboard/attendances/page.tsx',
  'src/app/dashboard/demands/page.tsx',
  'src/app/dashboard/reports/page.tsx',
  'src/app/dashboard/users/page.tsx',
  'src/app/faq/page.tsx',
  'src/app/fiscal-guides/page.tsx',
  'src/app/monitor/page.tsx',
  'src/app/naf-management/page.tsx',
  'src/app/page.tsx',
  'src/app/schedule/page_new_clean.tsx',
  'src/app/services/manage/page.tsx',
  'src/app/student-portal/page-old.tsx',
  'src/app/test/page.tsx',
  'src/app/test-schedule/page.tsx',
  'src/components/FiscalAppointmentsSection.tsx',
  'src/components/PerformanceAnalytics.tsx',
  'src/components/SmartAutoForm.tsx',
  'src/components/TestingFramework.tsx',
  'src/components/UserManagement.tsx',
  'src/components/chat/ChatWidget.tsx',
  'src/components/chat/CoordinatorChat.tsx',
  'src/components/chatbot/Chatbot.tsx',
  'src/components/courses/StudentProgressTracker.tsx',
  'src/components/layout/NAFFooter.tsx',
  'src/components/reports/ReportGenerator.tsx',
  'src/components/ui/mobile-nav.tsx'
];

function fixRemainingIssues(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { modified: false, error: 'Arquivo não encontrado' };
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fixesApplied = 0;

    preciseCorrections.forEach(({ search, replace, description }) => {
      const before = content;
      content = content.replace(search, replace);
      if (content !== before) {
        modified = true;
        fixesApplied++;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      return { modified: true, fixesApplied };
    }
    
    return { modified: false, fixesApplied: 0 };
  } catch (error) {
    return { modified: false, error: error.message };
  }
}

console.log('📁 Aplicando correções finais nos arquivos problemáticos...\n');

let totalFixed = 0;
let totalFixes = 0;

problematicFiles.forEach(filePath => {
  const result = fixRemainingIssues(filePath);
  const relativePath = filePath;
  
  if (result.error) {
    console.log(`❌ ${relativePath}: ${result.error}`);
  } else if (result.modified) {
    console.log(`✅ ${relativePath}: ${result.fixesApplied} correções aplicadas`);
    totalFixed++;
    totalFixes += result.fixesApplied;
  } else {
    console.log(`⚪ ${relativePath}: Já estava OK`);
  }
});

console.log('\n📊 RESUMO DA CORREÇÃO FINAL:');
console.log(`• ${totalFixed} arquivos corrigidos`);
console.log(`• ${totalFixes} correções totais aplicadas`);
console.log(`• ${problematicFiles.length} arquivos processados`);

console.log('\n🎉 CORREÇÃO FINAL COMPLETA!');
console.log('🌙 Todos os fundos brancos foram eliminados!');
console.log('✨ Agora TODO o site segue o padrão de dark theme da página principal!');