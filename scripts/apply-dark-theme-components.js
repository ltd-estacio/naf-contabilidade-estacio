const fs = require('fs');
const path = require('path');

// Componentes que precisam de dark theme
const componentsToUpdate = [
  'src/components/ClientNavigation.tsx',
  'src/components/CoordinatorDashboard.tsx',
  'src/components/AuthWrapper.tsx',
  'src/components/FormField.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/label.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/textarea.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/dropdown-menu.tsx',
];

// Transformações básicas para componentes
const componentTransformations = [
  // Fundos básicos
  { search: /bg-white([^-])/g, replace: 'bg-white dark:bg-gray-950$1' },
  { search: /bg-gray-50([^-])/g, replace: 'bg-gray-50 dark:bg-gray-900$1' },
  { search: /bg-gray-100([^-])/g, replace: 'bg-gray-100 dark:bg-gray-800$1' },
  
  // Textos principais  
  { search: /text-gray-900([^-])/g, replace: 'text-gray-900 dark:text-white$1' },
  { search: /text-gray-800([^-])/g, replace: 'text-gray-800 dark:text-gray-200$1' },
  { search: /text-gray-700([^-])/g, replace: 'text-gray-700 dark:text-gray-300$1' },
  { search: /text-gray-600([^-])/g, replace: 'text-gray-600 dark:text-gray-400$1' },
  
  // Bordas
  { search: /border-gray-200([^-])/g, replace: 'border-gray-200 dark:border-gray-800$1' },
  { search: /border-gray-300([^-])/g, replace: 'border-gray-300 dark:border-gray-700$1' },
  
  // Placeholder text
  { search: /placeholder:text-gray-500([^-])/g, replace: 'placeholder:text-gray-500 dark:placeholder:text-gray-400$1' },
  
  // Hover states
  { search: /hover:bg-gray-50([^-])/g, replace: 'hover:bg-gray-50 dark:hover:bg-gray-800$1' },
  { search: /hover:bg-gray-100([^-])/g, replace: 'hover:bg-gray-100 dark:hover:bg-gray-700$1' },
];

function applyDarkThemeToComponent(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Componente não encontrado: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Aplicar transformações básicas
    componentTransformations.forEach(({ search, replace }) => {
      const before = content;
      content = content.replace(search, replace);
      if (content !== before) modified = true;
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Dark theme aplicado em componente: ${filePath}`);
    } else {
      console.log(`⚪ Nenhuma mudança necessária em: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

console.log('🌙 Aplicando dark theme em componentes...\n');

componentsToUpdate.forEach(applyDarkThemeToComponent);

console.log('\n✅ Processo de componentes concluído!');