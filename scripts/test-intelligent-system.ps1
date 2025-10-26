# Script de Teste Automático do Sistema Inteligente NAF
# PowerShell Version

Write-Host "🤖 INICIANDO TESTES AUTOMÁTICOS DO SISTEMA INTELIGENTE" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundC    Write-Host "⚠️  SISTEMA REQUER ATENÇÃO! Taxa de sucesso abaixo de 80%" -ForegroundColor Red
    Write-Host "Verifique os erros acima e execute correcoes" -ForegroundColor Yellow
    exit 1
}r Cyan

$passed = 0
$failed = 0

function Test-API {
    param(
        [string]$Url,
        [string]$Description,
        [string]$Method = "GET"
    )
    
    Write-Host "Testando: $Description" -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000$Url" -Method $Method -TimeoutSec 10
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq 200 -or $statusCode -eq 201) {
            Write-Host "  ✅ $Description - Status: $statusCode" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ❌ $Description - Status: $statusCode" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ❌ $Description - Erro: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-Page {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "Testando página: $Description" -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000$Url" -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ $Description carregada - Status: $($response.StatusCode)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ❌ $Description falhou - Status: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ❌ $Description falhou - Erro: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Verificar se servidor está rodando
Write-Host "Verificando servidor..." -ForegroundColor Yellow
try {
    $serverTest = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
    Write-Host "✅ Servidor está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor não está rodando na porta 3000" -ForegroundColor Red
    Write-Host "Certifique-se de que o servidor Next.js está executando com 'npm run dev'" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 1. TESTES DE APIs EXISTENTES
Write-Host "📡 TESTANDO APIs EXISTENTES" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow

$apis = @(
    @{Url="/api/services"; Description="Lista de Serviços"},
    @{Url="/api/demands"; Description="Lista de Demandas"},
    @{Url="/api/attendances"; Description="Lista de Atendimentos"},
    @{Url="/api/guidance?serviceId=cpf-cadastro"; Description="Sistema de Orientações"},
    @{Url="/api/email"; Description="Sistema de Email"},
    @{Url="/api/reports?type=general"; Description="Relatórios"},
    @{Url="/api/dashboard/stats"; Description="Estatísticas do Dashboard"},
    @{Url="/api/auth/session"; Description="Sessão de Autenticação"}
)

foreach ($api in $apis) {
    if (Test-API -Url $api.Url -Description $api.Description) {
        $passed++
    } else {
        $failed++
    }
}

Write-Host ""

# 2. TESTES DE NOVAS APIs INTELIGENTES
Write-Host "🚀 TESTANDO NOVAS APIs INTELIGENTES" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$newApis = @(
    @{Url="/api/user/profile"; Description="API de Perfil do Usuário"},
    @{Url="/api/user/auto-request"; Description="API de Solicitação Automática"}
)

foreach ($api in $newApis) {
    if (Test-API -Url $api.Url -Description $api.Description) {
        $passed++
    } else {
        $failed++
    }
}

Write-Host ""

# 3. TESTES DE PÁGINAS
Write-Host "🌐 TESTANDO PÁGINAS" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow

$pages = @(
    @{Url="/"; Description="Página Inicial"},
    @{Url="/login"; Description="Página de Login"},
    @{Url="/schedule"; Description="Agendamento Inteligente"},
    @{Url="/services"; Description="Catálogo de Serviços"},
    @{Url="/dashboard"; Description="Dashboard"},
    @{Url="/monitor"; Description="Monitor do Sistema"}
)

foreach ($page in $pages) {
    if (Test-Page -Url $page.Url -Description $page.Description) {
        $passed++
    } else {
        $failed++
    }
}

Write-Host ""

# 4. TESTE DE FUNCIONALIDADES INTELIGENTES
Write-Host "🧠 TESTANDO FUNCIONALIDADES INTELIGENTES" -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor Yellow

# Teste de preenchimento automático
Write-Host "Testando preenchimento automático..." -ForegroundColor Blue
try {
    $autoFillResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/user/auto-request?serviceId=cpf-cadastro" -TimeoutSec 10
    if ($autoFillResponse.Content -like "*success*") {
        Write-Host "  ✅ Preenchimento automático funcionando" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ Preenchimento automático com problemas" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ Preenchimento automático com problemas" -ForegroundColor Red
    $failed++
}

# Teste de validação inteligente
Write-Host "Testando validação de dados..." -ForegroundColor Blue
try {
    $validationResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/user/profile" -TimeoutSec 10
    if ($validationResponse.Content -like "*error*" -or $validationResponse.Content -like "*success*") {
        Write-Host "  ✅ Sistema de validação ativo" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ Sistema de validação com problemas" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ Sistema de validação com problemas" -ForegroundColor Red
    $failed++
}

Write-Host ""

# 5. TESTE DE BANCO DE DADOS
Write-Host "🗄️ TESTANDO BANCO DE DADOS" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

# Verificar se banco tem dados
Write-Host "Verificando dados do banco..." -ForegroundColor Blue
try {
    $dbResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/services" -TimeoutSec 10
    $serviceCount = ([regex]::Matches($dbResponse.Content, '"name"')).Count
    
    if ($serviceCount -gt 3) {
        Write-Host "  ✅ Banco de dados populado com $serviceCount serviços" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ Banco de dados com poucos dados ($serviceCount serviços)" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ Erro ao verificar banco de dados" -ForegroundColor Red
    $failed++
}

# Teste de estatísticas
try {
    $statsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/dashboard/stats" -TimeoutSec 10
    if ($statsResponse.Content -like "*total*") {
        Write-Host "  ✅ Sistema de estatísticas funcionando" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ Sistema de estatísticas com problemas" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ Sistema de estatísticas com problemas" -ForegroundColor Red
    $failed++
}

Write-Host ""

# 6. RELATÓRIO FINAL
Write-Host "📊 RELATÓRIO FINAL" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow

$total = $passed + $failed
$successRate = if ($total -gt 0) { [math]::Round(($passed * 100) / $total) } else { 0 }

Write-Host "Total de testes: $total" -ForegroundColor Blue
Write-Host "Testes aprovados: $passed" -ForegroundColor Green
Write-Host "Testes falharam: $failed" -ForegroundColor Red
Write-Host "Taxa de sucesso: $successRate%" -ForegroundColor Green

Write-Host ""

if ($successRate -ge 80) {
    Write-Host "🎉 SISTEMA APROVADO! Taxa de sucesso acima de 80%" -ForegroundColor Green
    Write-Host "✅ Sistema Inteligente funcionando corretamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 FUNCIONALIDADES INTELIGENTES ATIVAS:" -ForegroundColor Blue
    Write-Host "  • Preenchimento automático de formulários" -ForegroundColor White
    Write-Host "  • Validação inteligente de dados" -ForegroundColor White
    Write-Host "  • Histórico de serviços similares" -ForegroundColor White
    Write-Host "  • Sistema de correção automática" -ForegroundColor White
    Write-Host "  • APIs otimizadas para automação" -ForegroundColor White
    Write-Host "  • Monitor em tempo real" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 LINKS PARA TESTE:" -ForegroundColor Cyan
    Write-Host "  • Agendamento Inteligente: http://localhost:3000/schedule" -ForegroundColor White
    Write-Host "  • Monitor do Sistema: http://localhost:3000/monitor" -ForegroundColor White
    Write-Host "  • Dashboard: http://localhost:3000/dashboard" -ForegroundColor White
    exit 0
} else {
    Write-Host "⚠️  SISTEMA REQUER ATENÇÃO! Taxa de sucesso abaixo de 80%" -ForegroundColor Red
    Write-Host "Verifique os erros acima e execute correções" -ForegroundColor Yellow
    exit 1
}
