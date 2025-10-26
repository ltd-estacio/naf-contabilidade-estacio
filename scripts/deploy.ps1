# Deploy Automático - PowerShell
# Sistema NAF Contábil

Write-Host "🚀 Iniciando deploy do Sistema NAF Contábil..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Configurar repositório remoto
Write-Host "📡 Conectando ao GitHub..." -ForegroundColor Yellow
git remote add origin https://github.com/cordeirotelecom/naf-contabil.git

# Verificar se tem mudanças para commit
Write-Host "📝 Adicionando arquivos..." -ForegroundColor Yellow
git add .

# Fazer commit
Write-Host "💾 Fazendo commit..." -ForegroundColor Yellow
git commit -m "feat: Deploy inicial do Sistema NAF Contábil completo"

# Enviar para GitHub
Write-Host "⬆️ Enviando código para GitHub..." -ForegroundColor Yellow
git push -u origin main

# Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SUCESSO! Código enviado para GitHub" -ForegroundColor Green
    Write-Host "🌐 Repositório: https://github.com/cordeirotelecom/naf-contabil" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 PRÓXIMO PASSO:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://netlify.com" -ForegroundColor White
    Write-Host "2. Conecte com GitHub" -ForegroundColor White
    Write-Host "3. Selecione: cordeirotelecom/naf-contabil" -ForegroundColor White
    Write-Host "4. Deploy automático!" -ForegroundColor White
    Write-Host ""
    Write-Host "✨ Seu sistema estará online em poucos minutos!" -ForegroundColor Green
    
    # Abrir URLs úteis
    Write-Host "🌐 Abrindo URLs úteis..." -ForegroundColor Yellow
    Start-Process "https://github.com/cordeirotelecom/naf-contabil"
    Start-Process "https://netlify.com"
} else {
    Write-Host ""
    Write-Host "❌ Erro no envio para GitHub" -ForegroundColor Red
    Write-Host "💡 Verifique se o repositório foi criado em:" -ForegroundColor Yellow
    Write-Host "   https://github.com/cordeirotelecom/naf-contabil" -ForegroundColor Cyan
}
