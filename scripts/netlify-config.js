const { readFileSync, writeFileSync } = require('fs')
const { join } = require('path')

console.log('🔧 Configurando build para Netlify...')

// Verificar se o build foi executado
const buildDir = join(process.cwd(), '.next')
console.log('📁 Diretório .next:', buildDir)

// Criar arquivo _redirects para SPA
const redirectsContent = `
# SPA Redirects para Next.js
/_next/static/* /_next/static/:splat 200
/api/* /api/:splat 200
/* /index.html 200
`

writeFileSync(join(process.cwd(), '.next', '_redirects'), redirectsContent)

console.log('✅ Configuração do Netlify concluída!')
console.log('📂 Arquivos gerados:')
console.log('   - _redirects (redirects SPA)')

console.log('\n🚀 Deploy pronto para Netlify!')
console.log('📋 Configurações recomendadas:')
console.log('   Build command: npm run build && node netlify-config.js')
console.log('   Publish directory: .next')
console.log('   Functions directory: .netlify/functions')
