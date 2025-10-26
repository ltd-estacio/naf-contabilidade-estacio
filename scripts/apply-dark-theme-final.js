const fs = require('fs');
const path = require('path');

// Componentes específicos que precisam de dark theme
const specialComponents = [
  'src/components/HelpCenter.tsx',
  'src/components/UserManagementComplete.tsx',
  'src/components/PowerBIAdvanced.tsx',
  'src/components/AdvancedScheduling.tsx',
  'src/components/ChatSystem.tsx',
  'src/components/ModuleViewer.tsx',
  'src/components/UserOnboarding.tsx',
  'src/components/notifications/NotificationCenter.tsx',
  'src/components/charts/SimpleChart.tsx',
  'src/components/SystemManagement.tsx',
  'src/components/coordinator/AppointmentManager.tsx',
  'src/components/coordinator/HistoryDashboard.tsx',
  'src/components/admin/AppointmentsPanel.tsx',
  'src/components/admin/UsersPanel.tsx',
  'src/components/RelatorioCoordrenador.tsx',
  'src/components/PowerBIEmbedded.tsx',
];

// Transformações específicas para componentes especializados
const specialTransformations = [
  // Fundos principais
  { search: /className="([^"]*\s)?bg-white(\s[^"]*)?"([^>]*>)/g, replace: 'className="$1bg-white dark:bg-gray-950$2"$3' },
  { search: /className="([^"]*\s)?bg-gray-50(\s[^"]*)?"([^>]*>)/g, replace: 'className="$1bg-gray-50 dark:bg-gray-900$2"$3' },
  { search: /className="([^"]*\s)?bg-gray-100(\s[^"]*)?"([^>]*>)/g, replace: 'className="$1bg-gray-100 dark:bg-gray-800$2"$3' },
  
  // Textos
  { search: /className="([^"]*\s)?text-gray-900(\s[^"]*)?"([^>]*>)/g, replace: 'className="$1text-gray-900 dark:text-white$2"$3' },
  { search: /className="([^"]*\s)?text-gray-800(\s[^"]*)?"([^>]*>)/g, replace: 'className="$1text-gray-800 dark:text-gray-200$2"$3' },
  { search: /className="([^"]*\s)?text-gray-700(\s[^"]*)?"([^>]*>)/g, replace: 'className="$1text-gray-700 dark:text-gray-300$2"$3' },
  { search: /className="([^"]*\s)?text-gray-600(\s[^"]*)?"([^>]*>)/g, replace: 'className="$1text-gray-600 dark:text-gray-400$2"$3' },
  
  // Bordas
  { search: /className="([^"]*\s)?border-gray-200(\s[^"]*)?"([^>]*>)/g, replace: 'className="$1border-gray-200 dark:border-gray-800$2"$3' },
  { search: /className="([^"]*\s)?border-gray-300(\s[^"]*)?"([^>]*>)/g, replace: 'className="$1border-gray-300 dark:border-gray-700$2"$3' },
];

// Padrões básicos mais simples para casos que os regex complexos não pegam
const basicPatterns = [
  { search: /bg-white([^-])/g, replace: 'bg-white dark:bg-gray-950$1' },
  { search: /bg-gray-50([^-])/g, replace: 'bg-gray-50 dark:bg-gray-900$1' },
  { search: /bg-gray-100([^-])/g, replace: 'bg-gray-100 dark:bg-gray-800$1' },
  { search: /text-gray-900([^-])/g, replace: 'text-gray-900 dark:text-white$1' },
  { search: /text-gray-800([^-])/g, replace: 'text-gray-800 dark:text-gray-200$1' },
  { search: /text-gray-700([^-])/g, replace: 'text-gray-700 dark:text-gray-300$1' },
  { search: /text-gray-600([^-])/g, replace: 'text-gray-600 dark:text-gray-400$1' },
  { search: /border-gray-200([^-])/g, replace: 'border-gray-200 dark:border-gray-800$1' },
  { search: /border-gray-300([^-])/g, replace: 'border-gray-300 dark:border-gray-700$1' },
];

function applyDarkThemeToSpecialComponent(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Componente não encontrado: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Primeiro aplicar padrões básicos
    basicPatterns.forEach(({ search, replace }) => {
      const before = content;
      content = content.replace(search, replace);
      if (content !== before) modified = true;
    });

    // Depois aplicar transformações mais específicas
    specialTransformations.forEach(({ search, replace }) => {
      const before = content;
      content = content.replace(search, (match, ...groups) => {
        // Evitar duplicar classes dark: já existentes
        if (match.includes('dark:')) return match;
        return replace.replace(/\$(\d+)/g, (_, num) => groups[parseInt(num) - 1] || '');
      });
      if (content !== before) modified = true;
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Dark theme aplicado em: ${filePath}`);
    } else {
      console.log(`⚪ Já tem dark theme ou nenhuma mudança necessária: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

console.log('🌙 Aplicando dark theme em componentes especializados...\n');

specialComponents.forEach(applyDarkThemeToSpecialComponent);

console.log('\n✅ Processo de componentes especializados concluído!');

// Também aplicar em qualquer página adicional que possa ter sido esquecida
const additionalPages = [
  'src/app/api-docs/page.tsx',
  'src/app/notifications/page.tsx', 
  'src/app/help/page.tsx',
  'src/app/settings/page.tsx',
];

console.log('\n🔍 Verificando páginas adicionais...\n');

additionalPages.forEach(applyDarkThemeToSpecialComponent);

console.log('\n🎉 Implementação de dark theme COMPLETA em todo o site!');