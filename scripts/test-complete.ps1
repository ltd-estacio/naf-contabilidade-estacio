# Script de Testes Completos - PowerShell
Write-Host "🧪 INICIANDO TESTES COMPLETOS DO SISTEMA NAF" -ForegroundColor Green
Write-Host "===============================================`n"

$baseUrl = "http://localhost:3000"
$testResults = @{
    passed = 0
    failed = 0
    total = 0
}

# Função para testar endpoint
function Test-Endpoint {
    param($url, $name)
    
    $testResults.total++
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
            Write-Host "  ✅ $name ($($response.StatusCode))" -ForegroundColor Green
            $testResults.passed++
            return $true
        } else {
            Write-Host "  ❌ $name ($($response.StatusCode))" -ForegroundColor Red
            $testResults.failed++
            return $false
        }
    } catch {
        Write-Host "  ❌ $name - ERRO: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.failed++
        return $false
    }
}

# Função para verificar arquivo
function Test-File {
    param($path, $name)
    
    $testResults.total++
    
    if (Test-Path $path) {
        Write-Host "  ✅ $name" -ForegroundColor Green
        $testResults.passed++
        return $true
    } else {
        Write-Host "  ❌ $name - ARQUIVO FALTANDO" -ForegroundColor Red
        $testResults.failed++
        return $false
    }
}

# Aguarda servidor inicializar
Write-Host "⏱️ Aguardando servidor inicializar...`n"
Start-Sleep -Seconds 3

# TESTE 1: Arquivos Essenciais
Write-Host "📁 TESTANDO ARQUIVOS ESSENCIAIS..." -ForegroundColor Yellow

$essentialFiles = @(
    @{ path = "package.json"; name = "package.json" },
    @{ path = "next.config.js"; name = "next.config.js" },
    @{ path = "tailwind.config.ts"; name = "tailwind.config.ts" },
    @{ path = "tsconfig.json"; name = "tsconfig.json" },
    @{ path = "prisma\schema.prisma"; name = "prisma/schema.prisma" },
    @{ path = "src\app\layout.tsx"; name = "src/app/layout.tsx" },
    @{ path = "src\app\page.tsx"; name = "src/app/page.tsx" },
    @{ path = "src\lib\auth.ts"; name = "src/lib/auth.ts" },
    @{ path = "src\lib\prisma.ts"; name = "src/lib/prisma.ts" },
    @{ path = "src\lib\email.ts"; name = "src/lib/email.ts" },
    @{ path = ".env.local"; name = ".env.local" }
)

foreach ($file in $essentialFiles) {
    Test-File $file.path $file.name
}

Write-Host ""

# TESTE 2: APIs
Write-Host "🌐 TESTANDO APIs..." -ForegroundColor Yellow

$apis = @(
    @{ url = "$baseUrl/api/auth/session"; name = "Auth Session" },
    @{ url = "$baseUrl/api/auth/providers"; name = "Auth Providers" },
    @{ url = "$baseUrl/api/services"; name = "Services" },
    @{ url = "$baseUrl/api/demands"; name = "Demands" },
    @{ url = "$baseUrl/api/attendances"; name = "Attendances" },
    @{ url = "$baseUrl/api/guidance?serviceId=cpf-cadastro"; name = "Guidance" },
    @{ url = "$baseUrl/api/email"; name = "Email Test" },
    @{ url = "$baseUrl/api/reports?type=general"; name = "Reports" },
    @{ url = "$baseUrl/api/dashboard/stats"; name = "Dashboard Stats" }
)

foreach ($api in $apis) {
    Test-Endpoint $api.url $api.name
}

Write-Host ""

# TESTE 3: Páginas
Write-Host "📄 TESTANDO PÁGINAS..." -ForegroundColor Yellow

$pages = @(
    @{ url = "$baseUrl/"; name = "Home" },
    @{ url = "$baseUrl/login"; name = "Login" },
    @{ url = "$baseUrl/register"; name = "Register" },
    @{ url = "$baseUrl/services"; name = "Services" },
    @{ url = "$baseUrl/schedule"; name = "Schedule" },
    @{ url = "$baseUrl/dashboard"; name = "Dashboard" },
    @{ url = "$baseUrl/monitor"; name = "Monitor" }
)

foreach ($page in $pages) {
    Test-Endpoint $page.url $page.name
}

Write-Host ""

# TESTE 4: Banco de Dados
Write-Host "🗄️ TESTANDO BANCO DE DADOS..." -ForegroundColor Yellow

Test-File "prisma\dev.db" "Arquivo do banco"

Write-Host ""

# Relatório Final
Write-Host "📊 RELATÓRIO FINAL DE TESTES" -ForegroundColor Cyan
Write-Host "============================`n"

$successRate = [math]::Round(($testResults.passed / $testResults.total) * 100, 1)

Write-Host "📈 RESUMO GERAL:"
Write-Host "   Total de testes: $($testResults.total)"
Write-Host "   ✅ Sucessos: $($testResults.passed)" -ForegroundColor Green
Write-Host "   ❌ Falhas: $($testResults.failed)" -ForegroundColor Red
Write-Host "   📊 Taxa de sucesso: $successRate%`n"

if ($successRate -ge 90) {
    Write-Host "🎉 SISTEMA EM EXCELENTE ESTADO!" -ForegroundColor Green
} elseif ($successRate -ge 75) {
    Write-Host "✅ SISTEMA EM BOM ESTADO - Algumas melhorias necessárias" -ForegroundColor Yellow
} elseif ($successRate -ge 50) {
    Write-Host "⚠️ SISTEMA PRECISA DE ATENÇÃO - Várias correções necessárias" -ForegroundColor Red
} else {
    Write-Host "🚨 SISTEMA COM PROBLEMAS CRÍTICOS - Requer intervenção imediata" -ForegroundColor Red
}

Write-Host "`n$('=' * 50)"

# Salva relatório
$reportData = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    summary = @{
        total = $testResults.total
        passed = $testResults.passed
        failed = $testResults.failed
        successRate = $successRate
    }
}

$reportData | ConvertTo-Json -Depth 3 | Out-File -FilePath "test-report-powershell.json" -Encoding UTF8

Write-Host "💾 Relatório salvo em: test-report-powershell.json" -ForegroundColor Green
