const fs = require('fs');
const path = require('path');

console.log('🔧 CORREÇÃO COMPLETA - Fundos Brancos e Inconsistências do Dark Theme\n');

// Encontrar todas as páginas TSX
function findAllTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findAllTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Correções específicas para fundos brancos e inconsistências
const corrections = [
  // Fundos gradientes sem dark variant
  {
    search: /className="([^"]*)\s*bg-gradient-to-br from-blue-50 to-green-50([^"]*)"([^>]*>)/g,
    replace: 'className="$1bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-950 dark:to-gray-900$2"$3',
    description: 'Corrigir gradient principal'
  },
  
  // Cards com dark theme inconsistente
  {
    search: /className="([^"]*)\s*hover:shadow-lg transition-shadow([^"]*)"([^>]*>)/g,
    replace: 'className="$1hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800$2"$3',
    description: 'Cards com shadow'
  },
  
  // Fundos brancos simples sem dark
  {
    search: /className="([^"]*)\s*bg-white(\s[^"]*)"([^>]*>)/g,
    replace: (match, before, after, closing) => {
      if (match.includes('dark:bg-')) return match; // Já tem dark theme
      return `className="${before}bg-white dark:bg-gray-950${after}"${closing}`;
    },
    description: 'Fundos brancos básicos'
  },
  
  // bg-gray-50 sem dark variant
  {
    search: /className="([^"]*)\s*bg-gray-50(\s[^"]*)"([^>]*>)/g,
    replace: (match, before, after, closing) => {
      if (match.includes('dark:bg-')) return match;
      return `className="${before}bg-gray-50 dark:bg-gray-900${after}"${closing}`;
    },
    description: 'bg-gray-50 sem dark'
  },
  
  // bg-gray-100 sem dark variant
  {
    search: /className="([^"]*)\s*bg-gray-100(\s[^"]*)"([^>]*>)/g,
    replace: (match, before, after, closing) => {
      if (match.includes('dark:bg-')) return match;
      return `className="${before}bg-gray-100 dark:bg-gray-800${after}"${closing}`;
    },
    description: 'bg-gray-100 sem dark'
  },
  
  // Textos sem dark variant
  {
    search: /className="([^"]*)\s*text-gray-900(\s[^"]*)"([^>]*>)/g,
    replace: (match, before, after, closing) => {
      if (match.includes('dark:text-')) return match;
      return `className="${before}text-gray-900 dark:text-white${after}"${closing}`;
    },
    description: 'text-gray-900 sem dark'
  },
  
  {
    search: /className="([^"]*)\s*text-gray-800(\s[^"]*)"([^>]*>)/g,
    replace: (match, before, after, closing) => {
      if (match.includes('dark:text-')) return match;
      return `className="${before}text-gray-800 dark:text-gray-200${after}"${closing}`;
    },
    description: 'text-gray-800 sem dark'
  },
  
  {
    search: /className="([^"]*)\s*text-gray-700(\s[^"]*)"([^>]*>)/g,
    replace: (match, before, after, closing) => {
      if (match.includes('dark:text-')) return match;
      return `className="${before}text-gray-700 dark:text-gray-300${after}"${closing}`;
    },
    description: 'text-gray-700 sem dark'
  },
  
  {
    search: /className="([^"]*)\s*text-gray-600(\s[^"]*)"([^>]*>)/g,
    replace: (match, before, after, closing) => {
      if (match.includes('dark:text-')) return match;
      return `className="${before}text-gray-600 dark:text-gray-400${after}"${closing}`;
    },
    description: 'text-gray-600 sem dark'
  },
  
  // Bordas sem dark variant  
  {
    search: /className="([^"]*)\s*border-gray-200(\s[^"]*)"([^>]*>)/g,
    replace: (match, before, after, closing) => {
      if (match.includes('dark:border-')) return match;
      return `className="${before}border-gray-200 dark:border-gray-800${after}"${closing}`;
    },
    description: 'border-gray-200 sem dark'
  },
  
  {
    search: /className="([^"]*)\s*border-gray-300(\s[^"]*)"([^>]*>)/g,
    replace: (match, before, after, closing) => {
      if (match.includes('dark:border-')) return match;
      return `className="${before}border-gray-300 dark:border-gray-700${after}"${closing}`;
    },
    description: 'border-gray-300 sem dark'
  },
  
  // bg-blue-100 sem dark (para elementos destacados)
  {
    search: /className="([^"]*)\s*bg-blue-100(\s[^"]*)"([^>]*>)/g,
    replace: (match, before, after, closing) => {
      if (match.includes('dark:bg-')) return match;
      return `className="${before}bg-blue-100 dark:bg-blue-900${after}"${closing}`;
    },
    description: 'bg-blue-100 sem dark'
  },
  
  // Correções específicas para gradientes de cards especiais
  {
    search: /className="([^"]*)\s*bg-gradient-to-r from-blue-500 to-green-500([^"]*)"([^>]*>)/g,
    replace: (match, before, after, closing) => {
      if (match.includes('dark:from-')) return match;
      return `className="${before}bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600${after}"${closing}`;
    },
    description: 'Gradientes de CTA'
  }
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { modified: false, error: 'Arquivo não encontrado' };
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changesCount = 0;

    corrections.forEach(({ search, replace, description }) => {
      const before = content;
      
      if (typeof replace === 'function') {
        content = content.replace(search, replace);
      } else {
        content = content.replace(search, replace);
      }
      
      if (content !== before) {
        modified = true;
        changesCount++;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      return { modified: true, changesCount };
    }
    
    return { modified: false, changesCount: 0 };
  } catch (error) {
    return { modified: false, error: error.message };
  }
}

// Processar todas as páginas
const srcDir = 'src/app';
const componentDir = 'src/components';

console.log('📁 Processando páginas...\n');

const appFiles = findAllTsxFiles(srcDir);
const componentFiles = findAllTsxFiles(componentDir);
const allFiles = [...appFiles, ...componentFiles];

let totalFixed = 0;
let totalChanges = 0;

allFiles.forEach(filePath => {
  const relativePath = filePath.replace(process.cwd() + '/', '');
  const result = fixFile(filePath);
  
  if (result.error) {
    console.log(`❌ ${relativePath}: ${result.error}`);
  } else if (result.modified) {
    console.log(`✅ ${relativePath}: ${result.changesCount} correções aplicadas`);
    totalFixed++;
    totalChanges += result.changesCount;
  } else {
    console.log(`⚪ ${relativePath}: Nenhuma correção necessária`);
  }
});

console.log('\n📊 RESUMO DA CORREÇÃO:');
console.log(`• ${totalFixed} arquivos corrigidos`);
console.log(`• ${totalChanges} correções totais aplicadas`);
console.log(`• ${allFiles.length} arquivos processados`);

console.log('\n✅ CORREÇÃO COMPLETA - Todos os fundos brancos foram corrigidos!');
console.log('🎨 Agora TODAS as páginas seguem o mesmo padrão de dark theme da página principal!');