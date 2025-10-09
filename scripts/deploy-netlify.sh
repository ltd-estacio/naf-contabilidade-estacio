#!/bin/bash

# Script de Deploy para Netlify
echo "🚀 Iniciando deploy para Netlify..."

# Verifica se git está configurado
if ! git config user.name > /dev/null; then
    echo "⚙️ Configurando Git..."
    git config user.name "cordeirotelecom"
    git config user.email "cordeirotelecom@gmail.com"
fi

# Adiciona todas as alterações
echo "📁 Adicionando arquivos..."
git add .

# Commit das alterações
echo "💾 Fazendo commit..."
git commit -m "feat: configuração final para produção Netlify

- Configurado next.config.js para export estático
- Adicionado netlify.toml com todas as configurações de produção
- Configurado environment variables para deploy
- Otimizado build para hosting estático no Netlify"

# Push para o repositório
echo "🌐 Enviando para GitHub..."
git push origin main

echo "✅ Deploy concluído! Seu site será automaticamente deployado no Netlify."
echo "🔗 Acesse: https://naf-contabil.netlify.app"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse o painel do Netlify"
echo "2. Configure as variáveis de ambiente usando o arquivo .env.netlify"
echo "3. Configure seu banco de dados PostgreSQL"
echo "4. Teste o site em produção"
