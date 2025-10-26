#!/bin/bash

# Script para adicionar campos de registro de atendimento à tabela fiscal_appointment_notes
# Uso: ./apply-attendance-fields-migration.sh

echo "🚀 Aplicando migration: Campos de Registro de Atendimento"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verifica se o arquivo SQL existe
SQL_FILE="./src/sql/add_attendance_fields_to_notes.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ Erro: Arquivo $SQL_FILE não encontrado${NC}"
    exit 1
fi

echo -e "${BLUE}📄 Arquivo SQL encontrado: $SQL_FILE${NC}"
echo ""

# Verifica se SUPABASE_DB_URL está definido
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${YELLOW}⚠️  Variável SUPABASE_DB_URL não encontrada${NC}"
    echo ""
    echo "Por favor, defina a URL do banco de dados:"
    echo "export SUPABASE_DB_URL='postgresql://postgres:[password]@[host]:5432/postgres'"
    echo ""
    echo "Ou execute o SQL manualmente no Supabase Dashboard:"
    echo "1. Acesse https://supabase.com/dashboard"
    echo "2. Vá em SQL Editor"
    echo "3. Cole o conteúdo de $SQL_FILE"
    echo "4. Execute"
    exit 1
fi

echo -e "${BLUE}🔗 Conectando ao banco de dados...${NC}"
echo ""

# Executa a migration
if psql "$SUPABASE_DB_URL" -f "$SQL_FILE"; then
    echo ""
    echo -e "${GREEN}✅ Migration aplicada com sucesso!${NC}"
    echo ""
    echo "Campos adicionados:"
    echo "  • note_type: Tipo da anotação (REGISTRO_INICIAL, ATUALIZACAO, GERAL)"
    echo "  • step_by_step: Passo a passo detalhado do atendimento"
    echo "  • stages: Etapas principais do processo"
    echo "  • summary: Resumo objetivo do atendimento"
    echo ""
    echo -e "${GREEN}🎉 Pronto! Agora o sistema de registro de atendimento está ativo.${NC}"
else
    echo ""
    echo -e "${RED}❌ Erro ao aplicar migration${NC}"
    echo ""
    echo "Se o erro persistir, execute manualmente:"
    echo "1. Copie o conteúdo de: $SQL_FILE"
    echo "2. Acesse: https://supabase.com/dashboard"
    echo "3. SQL Editor > New Query"
    echo "4. Cole e execute"
    exit 1
fi
