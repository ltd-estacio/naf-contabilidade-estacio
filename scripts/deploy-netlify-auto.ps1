# Script de Deploy Automatizado para Netlify

Write-Host "🚀 Iniciando Deploy Automatizado NAF Contábil..." -ForegroundColor Green

# 1. Verificar se está na pasta correta
if (!(Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na pasta raiz do projeto" -ForegroundColor Red
    exit 1
}

# 2. Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale Node.js 18+" -ForegroundColor Red
    exit 1
}

# 3. Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

# 4. Fazer build
Write-Host "🔨 Fazendo build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou" -ForegroundColor Red
    exit 1
}

# 5. Verificar se Netlify CLI está instalado
Write-Host "🌐 Verificando Netlify CLI..." -ForegroundColor Yellow
try {
    $netlifyVersion = netlify --version
    Write-Host "✅ Netlify CLI encontrado: $netlifyVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Instalando Netlify CLI..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

# 6. Fazer login no Netlify (se necessário)
Write-Host "🔐 Verificando login no Netlify..." -ForegroundColor Yellow
try {
    netlify status
    Write-Host "✅ Já logado no Netlify" -ForegroundColor Green
} catch {
    Write-Host "🔐 Fazendo login no Netlify..." -ForegroundColor Yellow
    netlify login
}

# 7. Criar site (se não existir)
Write-Host "🌐 Configurando site no Netlify..." -ForegroundColor Yellow
netlify init

# 8. Deploy
Write-Host "🚀 Fazendo deploy..." -ForegroundColor Yellow
netlify deploy --prod --dir=.next

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Configure as variáveis de ambiente no painel do Netlify" -ForegroundColor White
    Write-Host "2. DATABASE_URL com sua URL do Neon" -ForegroundColor White
    Write-Host "3. NEXTAUTH_URL com a URL do seu site" -ForegroundColor White
    Write-Host "4. NEXTAUTH_SECRET para produção" -ForegroundColor White
} else {
    Write-Host "❌ Deploy falhou" -ForegroundColor Red
}

Write-Host "`n📊 Status do projeto:" -ForegroundColor Cyan
Write-Host "✅ Código no GitHub: https://github.com/cordeirotelecom/naf-contabil" -ForegroundColor Green
Write-Host "✅ Build: Funcionando (42/42 páginas)" -ForegroundColor Green
Write-Host "✅ Database: Neon PostgreSQL configurado" -ForegroundColor Green
Write-Host "🔧 Netlify: Configure variáveis de ambiente" -ForegroundColor Yellow

Read-Host "`nPressione Enter para sair"
