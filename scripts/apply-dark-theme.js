const fs = require('fs');
const path = require('path');

// Páginas que precisam de dark theme
const pagesToUpdate = [
  'src/app/about-naf/page.tsx',
  'src/app/eligibility/page.tsx', 
  'src/app/fiscal-guides/page.tsx',
  'src/app/guides/page.tsx',
  'src/app/naf-login/page.tsx',
  'src/app/naf-services/page.tsx',
  'src/app/privacy-policy/page.tsx',
  'src/app/register/page.tsx',
  'src/app/schedule/page.tsx',
  'src/app/services/page.tsx',
  'src/app/student-login/page.tsx',
  'src/app/student-portal/page.tsx',
  'src/app/student-register/page.tsx',
  'src/app/terms-of-service/page.tsx',
  'src/app/coordinator-dashboard/page.tsx',
  'src/app/coordinator-login/page.tsx',
  'src/app/dashboard/page.tsx'
];

// Transformações básicas para aplicar dark theme
const transformations = [
  // Fundos básicos
  { search: /bg-white([^-])/g, replace: 'bg-white dark:bg-gray-950$1' },
  { search: /bg-gray-50([^-])/g, replace: 'bg-gray-50 dark:bg-gray-900$1' },
  { search: /bg-gray-100([^-])/g, replace: 'bg-gray-100 dark:bg-gray-800$1' },
  
  // Textos principais  
  { search: /text-gray-900([^-])/g, replace: 'text-gray-900 dark:text-white$1' },
  { search: /text-gray-800([^-])/g, replace: 'text-gray-800 dark:text-gray-200$1' },
  { search: /text-gray-700([^-])/g, replace: 'text-gray-700 dark:text-gray-300$1' },
  { search: /text-gray-600([^-])/g, replace: 'text-gray-600 dark:text-gray-400$1' },
  
  // Links e elementos azuis
  { search: /text-blue-600([^-])/g, replace: 'text-blue-600 dark:text-blue-400$1' },
  { search: /text-blue-700([^-])/g, replace: 'text-blue-700 dark:text-blue-300$1' },
  
  // Bordas
  { search: /border-gray-200([^-])/g, replace: 'border-gray-200 dark:border-gray-800$1' },
  { search: /border-gray-300([^-])/g, replace: 'border-gray-300 dark:border-gray-700$1' },
];

// Cards específicos
const cardTransformations = [
  { search: /<Card([^>]*className="[^"]*)">/g, replace: '<Card$1 dark:bg-gray-900 dark:border-gray-800">' },
];

function applyDarkTheme(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Arquivo não encontrado: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Aplicar transformações básicas
    transformations.forEach(({ search, replace }) => {
      const before = content;
      content = content.replace(search, replace);
      if (content !== before) modified = true;
    });

    // Aplicar transformações de cards (mais complexas)
    cardTransformations.forEach(({ search, replace }) => {
      const before = content;
      content = content.replace(search, (match, attributes) => {
        if (attributes.includes('dark:bg-')) return match; // Já tem dark theme
        return match.replace('">', ' dark:bg-gray-900 dark:border-gray-800">');
      });
      if (content !== before) modified = true;
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Dark theme aplicado em: ${filePath}`);
    } else {
      console.log(`⚪ Nenhuma mudança necessária em: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

console.log('🌙 Aplicando dark theme em múltiplas páginas...\n');

pagesToUpdate.forEach(applyDarkTheme);

console.log('\n✅ Processo concluído!');