#!/bin/bash

# Script para inicializar Git e preparar para GitHub
# Execute este script no terminal: bash init-git.sh

echo "🚀 Inicializando Git para o projeto NAF..."

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
echo "📦 Adicionando arquivos..."
git add .

# Fazer primeiro commit
echo "📝 Fazendo primeiro commit..."
git commit -m "feat: initial commit - Sistema NAF completo

- ✅ Configuração Next.js 14 com TypeScript
- ✅ Banco de dados PostgreSQL com Prisma
- ✅ Schema completo para NAF (usuários, serviços, agendamentos)
- ✅ Interface responsiva com Tailwind CSS
- ✅ Página inicial informativa
- ✅ Sistema de cadastro e login (frontend)
- ✅ Catálogo de serviços NAF
- ✅ Sistema de agendamento
- ✅ Integração com formulários Office 365
- ✅ Preparado para deploy no Netlify
- 📚 Documentação completa (README + DEPLOY)

Próximos passos:
- [ ] Implementar autenticação NextAuth.js
- [ ] Dashboard com gráficos e estatísticas
- [ ] APIs para CRUD completo
- [ ] Sistema de notificações por email
- [ ] Relatórios gerenciais"

echo "✅ Git inicializado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Criar repositório no GitHub"
echo "2. Executar: git remote add origin https://github.com/SEU_USUARIO/naf-contabil-sistema.git"
echo "3. Executar: git branch -M main"
echo "4. Executar: git push -u origin main"
echo ""
echo "📖 Consulte o arquivo DEPLOY.md para instruções completas!"
