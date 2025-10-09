#!/usr/bin/env powershell

# ============================================================================
# 🚀 VERIFICAÇÃO FINAL DO SISTEMA NAF CONTÁBIL
# ============================================================================
# Script para validar se o sistema está 100% funcional antes do deploy
# Data: $(Get-Date -Format "dd/MM/yyyy HH:mm")
# ============================================================================

Write-Host "🔍 VERIFICAÇÃO FINAL DO SISTEMA NAF CONTÁBIL" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

$errors = 0

# Verificar se estamos na pasta correta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERRO: Execute este script na pasta raiz do projeto" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pasta do projeto confirmada" -ForegroundColor Green

# Verificar arquivos essenciais
$essentialFiles = @(
    "package.json",
    "next.config.js",
    "netlify.toml",
    "src/app/page.tsx",
    "src/app/layout.tsx",
    "src/lib/auth.ts",
    "prisma/schema.prisma",
    ".env.template"
)

Write-Host "📁 Verificando arquivos essenciais..." -ForegroundColor Cyan
foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (FALTANDO)" -ForegroundColor Red
        $errors++
    }
}

# Verificar dependências
Write-Host ""
Write-Host "📦 Verificando dependências..." -ForegroundColor Cyan
try {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $depCount = ($packageJson.dependencies | Get-Member -MemberType NoteProperty).Count
    Write-Host "  ✅ $depCount dependências encontradas" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Erro ao ler package.json" -ForegroundColor Red
    $errors++
}

# Testar build
Write-Host ""
Write-Host "🔨 Testando build..." -ForegroundColor Cyan
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Build concluído com sucesso!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Build falhou!" -ForegroundColor Red
    Write-Host "  Saída do build:" -ForegroundColor Yellow
    Write-Host $buildOutput -ForegroundColor Yellow
    $errors++
}

# Verificar estrutura de páginas
Write-Host ""
Write-Host "📄 Verificando páginas..." -ForegroundColor Cyan
$pages = @(
    "src/app/page.tsx",
    "src/app/dashboard/page.tsx",
    "src/app/login/page.tsx",
    "src/app/services/page.tsx",
    "src/app/schedule/page.tsx"
)

foreach ($page in $pages) {
    if (Test-Path $page) {
        Write-Host "  ✅ $page" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $page (opcional)" -ForegroundColor Yellow
    }
}

# Verificar APIs
Write-Host ""
Write-Host "🔌 Verificando APIs..." -ForegroundColor Cyan
$apis = Get-ChildItem -Path "src/app/api" -Recurse -Name "route.ts" -ErrorAction SilentlyContinue
$apiCount = $apis.Count
Write-Host "  ✅ $apiCount APIs encontradas" -ForegroundColor Green

# Verificar configuração git
Write-Host ""
Write-Host "📋 Verificando Git..." -ForegroundColor Cyan
try {
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus) {
        Write-Host "  ⚠️  Há arquivos não commitados" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Repositório limpo" -ForegroundColor Green
    }
    
    $lastCommit = git log -1 --format="%h %s" 2>$null
    Write-Host "  📝 Último commit: $lastCommit" -ForegroundColor Cyan
} catch {
    Write-Host "  ⚠️  Git não configurado ou erro" -ForegroundColor Yellow
}

# Resultado final
Write-Host ""
Write-Host "📊 RESULTADO DA VERIFICAÇÃO:" -ForegroundColor Yellow
Write-Host "============================"

if ($errors -eq 0) {
    Write-Host "🎉 SISTEMA PERFEITO!" -ForegroundColor Green
    Write-Host "✅ Todas as verificações passaram"
    Write-Host "✅ Build funcionando corretamente"
    Write-Host "✅ Arquivos essenciais presentes"
    Write-Host "✅ Sistema pronto para deploy"
    Write-Host ""
    Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Green
    Write-Host "1. Configure as variáveis de ambiente no Netlify"
    Write-Host "2. Faça o deploy conectando o repositório GitHub"
    Write-Host "3. Teste o sistema em produção"
    Write-Host ""
    Write-Host "🔗 GitHub: https://github.com/cordeirotelecom/naf-contabil"
} else {
    Write-Host "❌ ENCONTRADOS $errors PROBLEMAS!" -ForegroundColor Red
    Write-Host "🔧 Corrija os problemas antes do deploy"
    exit 1
}

Write-Host ""
Write-Host "🏁 Verificação concluída!" -ForegroundColor Green
