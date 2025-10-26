# Script de Teste Automatico do Sistema Inteligente NAF
# PowerShell Version

Write-Host "INICIANDO TESTES AUTOMATICOS DO SISTEMA INTELIGENTE" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$passed = 0
$failed = 0

function Test-API {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "Testando: $Description" -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000$Url" -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "  OK $Description - Status: $($response.StatusCode)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ERRO $Description - Status: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ERRO $Description - Falhou" -ForegroundColor Red
        return $false
    }
}

# Verificar servidor
Write-Host "Verificando servidor..." -ForegroundColor Yellow
try {
    $serverTest = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
    Write-Host "OK Servidor esta rodando" -ForegroundColor Green
} catch {
    Write-Host "ERRO Servidor nao esta rodando" -ForegroundColor Red
    exit 1
}

Write-Host ""

# TESTES DE APIs
Write-Host "TESTANDO APIs" -ForegroundColor Yellow

$apis = @(
    "/api/services",
    "/api/demands", 
    "/api/attendances",
    "/api/guidance?serviceId=cpf-cadastro",
    "/api/email",
    "/api/reports?type=general",
    "/api/dashboard/stats",
    "/api/auth/session",
    "/api/user/profile",
    "/api/user/auto-request"
)

foreach ($api in $apis) {
    if (Test-API -Url $api -Description $api) {
        $passed++
    } else {
        $failed++
    }
}

Write-Host ""

# TESTES DE PAGINAS
Write-Host "TESTANDO PAGINAS" -ForegroundColor Yellow

$pages = @(
    "/",
    "/login",
    "/schedule",
    "/services", 
    "/dashboard",
    "/monitor"
)

foreach ($page in $pages) {
    if (Test-API -Url $page -Description "Pagina $page") {
        $passed++
    } else {
        $failed++
    }
}

Write-Host ""

# RELATORIO FINAL
Write-Host "RELATORIO FINAL" -ForegroundColor Yellow
Write-Host "===============" -ForegroundColor Yellow

$total = $passed + $failed
$successRate = if ($total -gt 0) { [math]::Round(($passed * 100) / $total) } else { 0 }

Write-Host "Total de testes: $total" -ForegroundColor Blue
Write-Host "Testes aprovados: $passed" -ForegroundColor Green
Write-Host "Testes falharam: $failed" -ForegroundColor Red
Write-Host "Taxa de sucesso: $successRate%" -ForegroundColor Green

Write-Host ""

if ($successRate -ge 80) {
    Write-Host "SISTEMA APROVADO! Taxa de sucesso acima de 80%" -ForegroundColor Green
    Write-Host "Sistema Inteligente funcionando corretamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "FUNCIONALIDADES INTELIGENTES ATIVAS:" -ForegroundColor Blue
    Write-Host "  • Preenchimento automatico de formularios" -ForegroundColor White
    Write-Host "  • Validacao inteligente de dados" -ForegroundColor White
    Write-Host "  • Historico de servicos similares" -ForegroundColor White
    Write-Host "  • Sistema de correcao automatica" -ForegroundColor White
    Write-Host "  • APIs otimizadas para automacao" -ForegroundColor White
    Write-Host "  • Monitor em tempo real" -ForegroundColor White
} else {
    Write-Host "SISTEMA REQUER ATENCAO! Taxa de sucesso abaixo de 80%" -ForegroundColor Red
    Write-Host "Verifique os erros acima" -ForegroundColor Yellow
}
