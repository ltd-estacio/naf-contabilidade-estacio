#!/bin/bash

# Script de Deploy Automático - NAF Contábil
# Para uso após criar o repositório no GitHub

echo "🚀 Iniciando deploy do Sistema NAF Contábil..."
echo "=================================================="

# Configurar repositório remoto
echo "📡 Conectando ao GitHub..."
git remote add origin https://github.com/cordeirotelecom/naf-contabil.git

# Verificar se tem mudanças para commit
echo "📝 Verificando mudanças..."
git add .
git commit -m "feat: Deploy inicial do Sistema NAF Contábil completo" || echo "Nenhuma mudança para commit"

# Enviar para GitHub
echo "⬆️ Enviando código para GitHub..."
git push -u origin main

# Verificar se foi enviado com sucesso
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCESSO! Código enviado para GitHub"
    echo "🌐 Repositório: https://github.com/cordeirotelecom/naf-contabil"
    echo ""
    echo "🚀 PRÓXIMO PASSO:"
    echo "1. Acesse: https://netlify.com"
    echo "2. Conecte com GitHub"
    echo "3. Selecione: cordeirotelecom/naf-contabil"
    echo "4. Deploy automático!"
    echo ""
    echo "✨ Seu sistema estará online em poucos minutos!"
else
    echo ""
    echo "❌ Erro no envio para GitHub"
    echo "💡 Verifique se o repositório foi criado em:"
    echo "   https://github.com/cordeirotelecom/naf-contabil"
fi
