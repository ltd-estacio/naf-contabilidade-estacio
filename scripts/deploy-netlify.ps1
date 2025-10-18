# Script de Deploy para Netlify (PowerShell)

Write-Host "🚀 Iniciando deploy para Netlify..." -ForegroundColor Cyan

# Verifica se git está configurado
$userName = git config user.name 2>$null
if (-not $userName) {
    Write-Host "⚙️ Configurando Git..." -ForegroundColor Yellow
    git config user.name "cordeirotelecom"
    git config user.email "cordeirotelecom@gmail.com"
}

# Adiciona todas as alterações
Write-Host "📁 Adicionando arquivos..." -ForegroundColor Green
git add .

# Commit das alterações
Write-Host "💾 Fazendo commit..." -ForegroundColor Green
git commit -m "feat: configuração final para produção Netlify

- Configurado next.config.js para export estático
- Adicionado netlify.toml com todas as configurações de produção
- Configurado environment variables para deploy
- Otimizado build para hosting estático no Netlify"

# Push para o repositório
Write-Host "🌐 Enviando para GitHub..." -ForegroundColor Blue
git push origin main

Write-Host "✅ Deploy concluído! Seu site será automaticamente deployado no Netlify." -ForegroundColor Green
Write-Host "🔗 Acesse: https://naf-contabil.netlify.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Acesse o painel do Netlify" -ForegroundColor White
Write-Host "2. Configure as variáveis de ambiente usando o arquivo .env.netlify" -ForegroundColor White
Write-Host "3. Configure seu banco de dados PostgreSQL" -ForegroundColor White
Write-Host "4. Teste o site em produção" -ForegroundColor White
