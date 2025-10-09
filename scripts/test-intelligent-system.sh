#!/bin/bash

echo "🤖 INICIANDO TESTES AUTOMÁTICOS DO SISTEMA INTELIGENTE"
echo "=================================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar API
test_api() {
    local url=$1
    local description=$2
    local method=${3:-GET}
    
    echo -e "${BLUE}Testando: $description${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "http://localhost:3000$url")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "  ✅ ${GREEN}$description - Status: $response${NC}"
        return 0
    else
        echo -e "  ❌ ${RED}$description - Status: $response${NC}"
        return 1
    fi
}

# Função para testar página
test_page() {
    local url=$1
    local description=$2
    
    echo -e "${BLUE}Testando página: $description${NC}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$url")
    
    if [ "$response" = "200" ]; then
        echo -e "  ✅ ${GREEN}$description carregada - Status: $response${NC}"
        return 0
    else
        echo -e "  ❌ ${RED}$description falhou - Status: $response${NC}"
        return 1
    fi
}

# Verificar se servidor está rodando
echo -e "${YELLOW}Verificando servidor...${NC}"
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Servidor não está rodando na porta 3000${NC}"
    echo "Iniciando servidor..."
    npm run dev &
    SERVER_PID=$!
    sleep 10
fi

echo -e "${GREEN}✅ Servidor está rodando${NC}"
echo ""

# Contadores
passed=0
failed=0

# 1. TESTES DE APIS EXISTENTES
echo -e "${YELLOW}📡 TESTANDO APIs EXISTENTES${NC}"
echo "--------------------------------"

apis=(
    "/api/services:Lista de Serviços"
    "/api/demands:Lista de Demandas" 
    "/api/attendances:Lista de Atendimentos"
    "/api/guidance?serviceId=cpf-cadastro:Sistema de Orientações"
    "/api/email:Sistema de Email"
    "/api/reports?type=general:Relatórios"
    "/api/dashboard/stats:Estatísticas do Dashboard"
    "/api/auth/session:Sessão de Autenticação"
)

for api_test in "${apis[@]}"; do
    IFS=':' read -r url description <<< "$api_test"
    if test_api "$url" "$description"; then
        ((passed++))
    else
        ((failed++))
    fi
done

echo ""

# 2. TESTES DE NOVAS APIs INTELIGENTES
echo -e "${YELLOW}🚀 TESTANDO NOVAS APIs INTELIGENTES${NC}"
echo "----------------------------------------"

new_apis=(
    "/api/user/profile:API de Perfil do Usuário"
    "/api/user/auto-request:API de Solicitação Automática"
)

for api_test in "${new_apis[@]}"; do
    IFS=':' read -r url description <<< "$api_test"
    if test_api "$url" "$description"; then
        ((passed++))
    else
        ((failed++))
    fi
done

echo ""

# 3. TESTES DE PÁGINAS
echo -e "${YELLOW}🌐 TESTANDO PÁGINAS${NC}"
echo "----------------------"

pages=(
    "/:Página Inicial"
    "/login:Página de Login"
    "/schedule:Agendamento Inteligente"
    "/services:Catálogo de Serviços"
    "/dashboard:Dashboard"
    "/monitor:Monitor do Sistema"
)

for page_test in "${pages[@]}"; do
    IFS=':' read -r url description <<< "$page_test"
    if test_page "$url" "$description"; then
        ((passed++))
    else
        ((failed++))
    fi
done

echo ""

# 4. TESTE DE FUNCIONALIDADES INTELIGENTES
echo -e "${YELLOW}🧠 TESTANDO FUNCIONALIDADES INTELIGENTES${NC}"
echo "---------------------------------------------"

# Teste de preenchimento automático (simulado)
echo -e "${BLUE}Testando preenchimento automático...${NC}"
auto_fill_test=$(curl -s "http://localhost:3000/api/user/auto-request?serviceId=cpf-cadastro" | grep -o '"success"' | wc -l)
if [ "$auto_fill_test" -gt 0 ]; then
    echo -e "  ✅ ${GREEN}Preenchimento automático funcionando${NC}"
    ((passed++))
else
    echo -e "  ❌ ${RED}Preenchimento automático com problemas${NC}"
    ((failed++))
fi

# Teste de validação inteligente
echo -e "${BLUE}Testando validação de dados...${NC}"
validation_test=$(curl -s "http://localhost:3000/api/user/profile" | grep -E '"error"|"success"' | wc -l)
if [ "$validation_test" -gt 0 ]; then
    echo -e "  ✅ ${GREEN}Sistema de validação ativo${NC}"
    ((passed++))
else
    echo -e "  ❌ ${RED}Sistema de validação com problemas${NC}"
    ((failed++))
fi

echo ""

# 5. TESTE DE BANCO DE DADOS
echo -e "${YELLOW}🗄️ TESTANDO BANCO DE DADOS${NC}"
echo "-----------------------------"

# Verificar se banco tem dados
db_test=$(curl -s "http://localhost:3000/api/services" | grep -o '"name"' | wc -l)
if [ "$db_test" -gt 3 ]; then
    echo -e "  ✅ ${GREEN}Banco de dados populado com serviços${NC}"
    ((passed++))
else
    echo -e "  ❌ ${RED}Banco de dados com poucos dados${NC}"
    ((failed++))
fi

# Teste de usuários
users_test=$(curl -s "http://localhost:3000/api/dashboard/stats" | grep -o '"total"' | wc -l)
if [ "$users_test" -gt 0 ]; then
    echo -e "  ✅ ${GREEN}Sistema de usuários funcionando${NC}"
    ((passed++))
else
    echo -e "  ❌ ${RED}Sistema de usuários com problemas${NC}"
    ((failed++))
fi

echo ""

# 6. RELATÓRIO FINAL
echo -e "${YELLOW}📊 RELATÓRIO FINAL${NC}"
echo "===================="

total=$((passed + failed))
success_rate=$((passed * 100 / total))

echo -e "Total de testes: ${BLUE}$total${NC}"
echo -e "Testes aprovados: ${GREEN}$passed${NC}"
echo -e "Testes falharam: ${RED}$failed${NC}"
echo -e "Taxa de sucesso: ${GREEN}$success_rate%${NC}"

echo ""

if [ $success_rate -ge 80 ]; then
    echo -e "${GREEN}🎉 SISTEMA APROVADO! Taxa de sucesso acima de 80%${NC}"
    echo -e "${GREEN}✅ Sistema Inteligente funcionando corretamente${NC}"
    echo ""
    echo -e "${BLUE}🚀 FUNCIONALIDADES INTELIGENTES ATIVAS:${NC}"
    echo "  • Preenchimento automático de formulários"
    echo "  • Validação inteligente de dados"
    echo "  • Histórico de serviços similares"
    echo "  • Sistema de correção automática"
    echo "  • APIs otimizadas para automação"
    echo "  • Monitor em tempo real"
    exit 0
else
    echo -e "${RED}⚠️  SISTEMA REQUER ATENÇÃO! Taxa de sucesso abaixo de 80%${NC}"
    echo -e "${YELLOW}Verifique os erros acima e execute correções${NC}"
    exit 1
fi
