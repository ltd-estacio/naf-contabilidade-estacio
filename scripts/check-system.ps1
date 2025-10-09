# Verificacao do Sistema NAF Contabil
Write-Host "================================="
Write-Host "  VERIFICACAO NAF CONTABIL"
Write-Host "================================="

$errors = 0

# 1. Arquivos essenciais
Write-Host "`n1. Verificando arquivos..."
$files = @("package.json", "next.config.js", "tailwind.config.ts", "netlify.toml")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $errors++
    }
}

# 2. Estrutura do projeto
Write-Host "`n2. Verificando estrutura..."
$folders = @("src", "src/app", "src/components")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Write-Host "✅ $folder/" -ForegroundColor Green
    } else {
        Write-Host "❌ $folder/" -ForegroundColor Red
        $errors++
    }
}

# 3. Node modules
Write-Host "`n3. Verificando dependencias..."
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules" -ForegroundColor Red
    $errors++
}

# 4. Git
Write-Host "`n4. Verificando Git..."
if (Test-Path ".git") {
    Write-Host "✅ Git inicializado" -ForegroundColor Green
} else {
    Write-Host "❌ Git nao inicializado" -ForegroundColor Red
    $errors++
}

# 5. Versoes
Write-Host "`n5. Versoes do ambiente..."
Write-Host "Node: $(node --version)"
Write-Host "NPM: $(npm --version)"

# 6. Package.json info
if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
    Write-Host "`n6. Informacoes do projeto..."
    Write-Host "Nome: $($pkg.name)"
    Write-Host "Versao: $($pkg.version)"
}

# Resultado final
Write-Host "`n================================="
if ($errors -eq 0) {
    Write-Host "🎉 SISTEMA OK!" -ForegroundColor Green
    Write-Host "Pronto para deploy!"
} else {
    Write-Host "❌ $errors PROBLEMAS!" -ForegroundColor Red
    Write-Host "Corrija antes do deploy"
}
Write-Host "================================="
