// Script para corrigir erros de Server Components
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'app');

// Padrões problemáticos que precisam ser corrigidos
const problematicPatterns = [
  {
    // React hooks em Server Components
    pattern: /^(?!.*['"]use client['"]).*\b(useState|useEffect|useCallback|useMemo|useContext|useRef|useReducer|useImperativeHandle|useLayoutEffect|useDebugValue)\s*\(/gm,
    fix: (content) => `'use client'\n\n${content}`
  },
  {
    // Event handlers em Server Components  
    pattern: /^(?!.*['"]use client['"]).*\b(onClick|onChange|onSubmit|onFocus|onBlur|onMouseEnter|onMouseLeave|onKeyDown|onKeyUp)\s*=/gm,
    fix: (content) => `'use client'\n\n${content}`
  },
  {
    // Window object access
    pattern: /^(?!.*['"]use client['"]).*\bwindow\./gm,
    fix: (content) => `'use client'\n\n${content}`
  },
  {
    // Document object access
    pattern: /^(?!.*['"]use client['"]).*\bdocument\./gm,
    fix: (content) => `'use client'\n\n${content}`
  },
  {
    // Browser APIs
    pattern: /^(?!.*['"]use client['"]).*\b(localStorage|sessionStorage|navigator|location)\b/gm,
    fix: (content) => `'use client'\n\n${content}`
  }
];

function shouldBeClientComponent(content) {
  return problematicPatterns.some(pattern => pattern.pattern.test(content));
}

function fixServerComponent(filePath, content) {
  // Se já tem 'use client', não precisa alterar
  if (content.includes("'use client'") || content.includes('"use client"')) {
    return content;
  }

  // Se tem padrões que requerem client component
  if (shouldBeClientComponent(content)) {
    console.log(`Adicionando 'use client' em: ${filePath}`);
    return `'use client'\n\n${content}`;
  }

  // Remove objetos complexos que podem causar serialização
  let fixedContent = content;

  // Remove spread operators em props que podem causar problemas
  fixedContent = fixedContent.replace(/\{\.\.\.([^}]+)\}/g, (match, spread) => {
    if (spread.includes('props') || spread.includes('rest')) {
      return match; // Mantém spreads básicos
    }
    return '{}'; // Remove spreads complexos
  });

  // Remove funções inline complexas
  fixedContent = fixedContent.replace(/\{[^{}]*=>\s*[^{}]*\{[^{}]*\}[^{}]*\}/g, '{}');

  return fixedContent;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixServerComponent(filePath, content);
    
    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`Corrigido: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  let filesFixed = 0;
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        filesFixed += processDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
        if (processFile(fullPath)) {
          filesFixed++;
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao processar diretório ${dir}:`, error.message);
  }
  
  return filesFixed;
}

console.log('Iniciando correção de Server Components...');
const fixedCount = processDirectory(srcPath);
console.log(`Concluído! ${fixedCount} arquivos corrigidos.`);
