const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICAÇÃO FINAL - Buscando Fundos Brancos Restantes\n');

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

function checkForWhiteBackgrounds(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Procurar padrões que podem indicar fundos brancos sem dark theme
    const patterns = [
      {
        regex: /className="[^"]*bg-white(?!.*dark:bg-)[^"]*"/g,
        description: 'bg-white sem dark variant'
      },
      {
        regex: /className="[^"]*bg-gray-50(?!.*dark:bg-)[^"]*"/g,
        description: 'bg-gray-50 sem dark variant'
      },
      {
        regex: /className="[^"]*bg-gray-100(?!.*dark:bg-)[^"]*"/g,
        description: 'bg-gray-100 sem dark variant'
      },
      {
        regex: /className="[^"]*text-gray-900(?!.*dark:text-)[^"]*"/g,
        description: 'text-gray-900 sem dark variant'
      },
      {
        regex: /className="[^"]*border-gray-200(?!.*dark:border-)[^"]*"/g,
        description: 'border-gray-200 sem dark variant'
      }
    ];

    patterns.forEach(({ regex, description }) => {
      const matches = content.match(regex);
      if (matches) {
        issues.push({
          description,
          count: matches.length,
          examples: matches.slice(0, 3) // Mostrar apenas os primeiros 3 exemplos
        });
      }
    });

    return issues;
  } catch (error) {
    return [{ description: 'Erro ao ler arquivo', count: 1, examples: [error.message] }];
  }
}

const srcDir = 'src/app';
const componentDir = 'src/components';

const appFiles = findAllTsxFiles(srcDir);
const componentFiles = findAllTsxFiles(componentDir);
const allFiles = [...appFiles, ...componentFiles];

console.log(`📁 Verificando ${allFiles.length} arquivos...\n`);

let totalIssues = 0;
let filesWithIssues = 0;

allFiles.forEach(filePath => {
  const relativePath = filePath.replace(process.cwd() + '/', '');
  const issues = checkForWhiteBackgrounds(filePath);
  
  if (issues.length > 0) {
    console.log(`⚠️  ${relativePath}:`);
    issues.forEach(issue => {
      console.log(`   • ${issue.description}: ${issue.count} ocorrências`);
      totalIssues += issue.count;
    });
    console.log('');
    filesWithIssues++;
  }
});

if (totalIssues === 0) {
  console.log('🎉 PERFEITO! Nenhum fundo branco sem dark theme foi encontrado!');
  console.log('✅ Todas as páginas e componentes seguem o padrão consistente de dark theme.');
} else {
  console.log(`📊 RESUMO DA VERIFICAÇÃO:`);
  console.log(`• ${filesWithIssues} arquivos com possíveis problemas`);
  console.log(`• ${totalIssues} problemas potenciais encontrados`);
  console.log(`• ${allFiles.length - filesWithIssues} arquivos OK`);
}

console.log('\n🌙 VERIFICAÇÃO COMPLETA!');