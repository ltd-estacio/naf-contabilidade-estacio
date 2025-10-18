# Verificacao Final do Sistema NAF Contabil
# Script para validar estado do projeto antes do deploy

Write-Host "======================================"
Write-Host "   VERIFICACAO SISTEMA NAF CONTABIL"
Write-Host "======================================"

$errors = 0

try {
    # 1. Verificar arquivos essenciais
    Write-Host "`n1. Verificando arquivos essenciais..."
    $requiredFiles = @(
        "package.json",
        "next.config.js",
        "tailwind.config.ts",
        "netlify.toml",
        ".env.template"
    )
    
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Host "✅ $file" -ForegroundColor Green
        } else {
            Write-Host "❌ $file NAO ENCONTRADO" -ForegroundColor Red
            $errors++
        }
    }
    
    # 2. Verificar package.json
    Write-Host "`n2. Verificando package.json..."
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    Write-Host "📦 Nome: $($packageJson.name)"
    Write-Host "📋 Versao: $($packageJson.version)"
    Write-Host "🔧 Scripts: $($packageJson.scripts.PSObject.Properties.Name.Count) encontrados"
    
    # 3. Verificar dependencias
    Write-Host "`n3. Verificando node_modules..."
    if (Test-Path "node_modules") {
        Write-Host "✅ node_modules existe" -ForegroundColor Green
    } else {
        Write-Host "❌ node_modules nao encontrado - execute 'npm install'" -ForegroundColor Red
        $errors++
    }
    
    # 4. Verificar estrutura de arquivos
    Write-Host "`n4. Verificando estrutura do projeto..."
    $folders = @("src", "src/app", "src/components", "src/lib")
    foreach ($folder in $folders) {
        if (Test-Path $folder) {
            Write-Host "✅ $folder/" -ForegroundColor Green
        } else {
            Write-Host "❌ $folder/ nao encontrado" -ForegroundColor Red
            $errors++
        }
    }
    
    # 5. Verificar configuracoes
    Write-Host "`n5. Verificando configuracoes..."
    
    # Next.js config
    if (Test-Path "next.config.js") {
        Write-Host "✅ Next.js configurado" -ForegroundColor Green
    }
    
    # Tailwind config
    if (Test-Path "tailwind.config.ts") {
        Write-Host "✅ Tailwind configurado" -ForegroundColor Green
    }
    
    # Netlify config
    if (Test-Path "netlify.toml") {
        Write-Host "✅ Netlify configurado" -ForegroundColor Green
    }
    
    # 6. Verificar Git
    Write-Host "`n6. Verificando repositorio Git..."
    if (Test-Path ".git") {
        Write-Host "✅ Repositorio Git inicializado" -ForegroundColor Green
        try {
            $gitStatus = git status --porcelain 2>$null
            if ($gitStatus) {
                Write-Host "⚠️  Existem mudancas nao commitadas" -ForegroundColor Yellow
            } else {
                Write-Host "✅ Repositorio limpo" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  Erro ao verificar status do Git" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Repositorio Git nao inicializado" -ForegroundColor Red
        $errors++
    }
    
    # 7. Teste rapido de build
    Write-Host "`n7. Testando build (rapido)..."
    Write-Host "Executando: npm run type-check..."
    $typeCheck = npm run type-check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Type check passou" -ForegroundColor Green
    } else {
        Write-Host "❌ Type check falhou" -ForegroundColor Red
        $errors++
    }
    
    # 8. Verificar ambiente
    Write-Host "`n8. Verificando ambiente..."
    Write-Host "Node version: $(node --version)"
    Write-Host "NPM version: $(npm --version)"
    
    # 9. Status final
    Write-Host "`n======================================"
    if ($errors -eq 0) {
        Write-Host "🎉 SISTEMA PRONTO PARA DEPLOY!" -ForegroundColor Green
        Write-Host ""
        Write-Host "✅ Todos os arquivos encontrados"
        Write-Host "✅ Dependencias instaladas"
        Write-Host "✅ Configuracoes OK"
        Write-Host "✅ Git inicializado"
        Write-Host ""
        Write-Host "📝 Proximo passo: Deploy no Netlify"
        Write-Host "🔗 GitHub: https://github.com/cordeirotelecom/naf-contabil"
    } else {
        Write-Host "❌ ENCONTRADOS $errors PROBLEMAS!" -ForegroundColor Red
        Write-Host "🔧 Corrija os problemas antes do deploy"
        exit 1
    }
    
    Write-Host ""
    Write-Host "🏁 Verificacao concluida!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erro na verificacao: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
