# Script para inicializar Git e preparar para GitHub (Windows PowerShell)
# Execute este script no PowerShell: .\init-git.ps1

Write-Host "🚀 Inicializando Git para o projeto NAF..." -ForegroundColor Green

# Inicializar repositório Git
Write-Host "📦 Inicializando repositório Git..." -ForegroundColor Yellow
git init

# Adicionar todos os arquivos
Write-Host "📦 Adicionando arquivos..." -ForegroundColor Yellow
git add .

# Fazer primeiro commit
Write-Host "📝 Fazendo primeiro commit..." -ForegroundColor Yellow
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

Write-Host "✅ Git inicializado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Criar repositório no GitHub"
Write-Host "2. Executar: git remote add origin https://github.com/SEU_USUARIO/naf-contabil-sistema.git"
Write-Host "3. Executar: git branch -M main"
Write-Host "4. Executar: git push -u origin main"
Write-Host ""
Write-Host "📖 Consulte o arquivo DEPLOY.md para instruções completas!" -ForegroundColor Yellow
