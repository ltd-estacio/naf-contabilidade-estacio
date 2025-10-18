# Script de Testes Completos - Sistema NAF
# Configuração de codificação
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "TESTES COMPLETOS DO SISTEMA NAF" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:3000"
$testResults = @{
    passed = 0
    failed = 0
    total = 0
    details = @{}
}

# Função para testar endpoint
function Test-Endpoint {
    param($url, $name)
    
    $testResults.total++
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 15 -ErrorAction Stop
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
            Write-Host "  OK $name ($($response.StatusCode))" -ForegroundColor Green
            $testResults.passed++
            $testResults.details[$name] = "PASS"
            return $true
        } else {
            Write-Host "  ERRO $name ($($response.StatusCode))" -ForegroundColor Red
            $testResults.failed++
            $testResults.details[$name] = "FAIL - HTTP $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-Host "  ERRO $name - $($_.Exception.Message)" -ForegroundColor Red
        $testResults.failed++
        $testResults.details[$name] = "FAIL - $($_.Exception.Message)"
        return $false
    }
}

# Função para verificar arquivo
function Test-File {
    param($path, $name)
    
    $testResults.total++
    
    if (Test-Path $path) {
        Write-Host "  OK $name" -ForegroundColor Green
        $testResults.passed++
        $testResults.details[$name] = "PASS"
        return $true
    } else {
        Write-Host "  ERRO $name - Arquivo faltando" -ForegroundColor Red
        $testResults.failed++
        $testResults.details[$name] = "FAIL - Arquivo faltando"
        return $false
    }
}

# Aguarda servidor
Write-Host "Aguardando servidor inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# TESTE 1: Arquivos Essenciais
Write-Host ""
Write-Host "1. TESTANDO ARQUIVOS ESSENCIAIS" -ForegroundColor Cyan

Test-File "package.json" "package.json"
Test-File "next.config.js" "next.config.js"
Test-File "tailwind.config.ts" "tailwind.config.ts"
Test-File "tsconfig.json" "tsconfig.json"
Test-File "prisma\schema.prisma" "prisma/schema.prisma"
Test-File "src\app\layout.tsx" "src/app/layout.tsx"
Test-File "src\app\page.tsx" "src/app/page.tsx"
Test-File "src\lib\auth.ts" "src/lib/auth.ts"
Test-File "src\lib\prisma.ts" "src/lib/prisma.ts"
Test-File "src\lib\email.ts" "src/lib/email.ts"
Test-File ".env.local" ".env.local"

# TESTE 2: APIs
Write-Host ""
Write-Host "2. TESTANDO APIs" -ForegroundColor Cyan

Test-Endpoint "$baseUrl/api/auth/session" "Auth Session"
Test-Endpoint "$baseUrl/api/auth/providers" "Auth Providers"
Test-Endpoint "$baseUrl/api/services" "Services API"
Test-Endpoint "$baseUrl/api/demands" "Demands API"
Test-Endpoint "$baseUrl/api/attendances" "Attendances API"
Test-Endpoint "$baseUrl/api/guidance?serviceId=cpf-cadastro" "Guidance API"
Test-Endpoint "$baseUrl/api/email" "Email API"
Test-Endpoint "$baseUrl/api/reports?type=general" "Reports API"
Test-Endpoint "$baseUrl/api/dashboard/stats" "Dashboard Stats API"

# TESTE 3: Páginas
Write-Host ""
Write-Host "3. TESTANDO PAGINAS" -ForegroundColor Cyan

Test-Endpoint "$baseUrl/" "Home Page"
Test-Endpoint "$baseUrl/login" "Login Page"
Test-Endpoint "$baseUrl/register" "Register Page"
Test-Endpoint "$baseUrl/services" "Services Page"
Test-Endpoint "$baseUrl/schedule" "Schedule Page"
Test-Endpoint "$baseUrl/dashboard" "Dashboard Page"
Test-Endpoint "$baseUrl/monitor" "Monitor Page"

# TESTE 4: Banco de Dados
Write-Host ""
Write-Host "4. TESTANDO BANCO DE DADOS" -ForegroundColor Cyan

Test-File "prisma\dev.db" "Database File"

# Relatório Final
Write-Host ""
Write-Host "RELATORIO FINAL" -ForegroundColor Magenta
Write-Host "===============" -ForegroundColor Magenta
Write-Host ""

$successRate = [math]::Round(($testResults.passed / $testResults.total) * 100, 1)

Write-Host "RESUMO:"
Write-Host "  Total de testes: $($testResults.total)"
Write-Host "  Sucessos: $($testResults.passed)" -ForegroundColor Green
Write-Host "  Falhas: $($testResults.failed)" -ForegroundColor Red
Write-Host "  Taxa de sucesso: $successRate%"
Write-Host ""

if ($successRate -ge 90) {
    Write-Host "STATUS: SISTEMA EM EXCELENTE ESTADO!" -ForegroundColor Green
} elseif ($successRate -ge 75) {
    Write-Host "STATUS: SISTEMA EM BOM ESTADO" -ForegroundColor Yellow
} elseif ($successRate -ge 50) {
    Write-Host "STATUS: SISTEMA PRECISA DE ATENCAO" -ForegroundColor Red
} else {
    Write-Host "STATUS: SISTEMA COM PROBLEMAS CRITICOS" -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================="

# Salva relatório
$reportData = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    summary = @{
        total = $testResults.total
        passed = $testResults.passed
        failed = $testResults.failed
        successRate = $successRate
    }
    details = $testResults.details
}

$reportData | ConvertTo-Json -Depth 3 | Out-File -FilePath "test-report.json" -Encoding UTF8

Write-Host "Relatorio salvo em: test-report.json" -ForegroundColor Green
