// Script para adicionar dynamic = 'force-dynamic' em todas as APIs com getServerSession
const fs = require('fs');
const path = require('path');

const apiRoutes = [
  'src/app/api/dashboard/stats/route.ts',
  'src/app/api/services/route.ts',
  'src/app/api/demands/route.ts',
  'src/app/api/attendances/route.ts',
  'src/app/api/guidance/route.ts',
  'src/app/api/reports/route.ts',
  'src/app/api/user/profile/route.ts',
  'src/app/api/user/auto-request/route.ts',
  'src/app/api/services/manage/route.ts',
  'src/app/api/notifications/route.ts',
  'src/app/api/system/metrics/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/schedule/route.ts'
];

function addDynamicExport(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`Arquivo não encontrado: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Verifica se já tem o export dynamic
    if (content.includes('export const dynamic')) {
      console.log(`Já tem dynamic export: ${filePath}`);
      return false;
    }

    // Verifica se tem getServerSession
    if (!content.includes('getServerSession')) {
      console.log(`Não usa getServerSession: ${filePath}`);
      return false;
    }

    // Encontra a primeira linha de import
    const lines = content.split('\n');
    let insertIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('export async function')) {
        insertIndex = i;
        break;
      }
    }

    if (insertIndex === -1) {
      console.log(`Não encontrou função export: ${filePath}`);
      return false;
    }

    // Insere a linha antes da primeira função export
    lines.splice(insertIndex, 0, '', 'export const dynamic = \'force-dynamic\'');
    
    const newContent = lines.join('\n');
    fs.writeFileSync(fullPath, newContent);
    
    console.log(`✅ Adicionado dynamic export: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Adicionando dynamic exports nas APIs...');
let count = 0;

for (const route of apiRoutes) {
  if (addDynamicExport(route)) {
    count++;
  }
}

console.log(`✅ Concluído! ${count} arquivos modificados.`);
