# Sistema de Atendimentos Fiscais - Documentação

## Visão Geral

Sistema completo de gerenciamento de atendimentos fiscais para o NAF Contábil, permitindo que estudantes realizem atendimentos, clientes avaliem o serviço, e coordenadores monitorem o desempenho.

## Funcionalidades Implementadas

### 1. Banco de Dados

**Tabela: `fiscal_appointment_feedbacks`**
- Armazena feedbacks dos clientes sobre atendimentos fiscais
- Campos principais:
  - `rating`: Avaliação geral (1-5 estrelas)
  - `service_quality`: Qualidade do serviço (1-5)
  - `student_attention`: Atenção do estudante (1-5)
  - `problem_resolution`: Resolução do problema (1-5)
  - `would_recommend`: Se recomendaria o serviço
  - `feedback_text`: Comentários do cliente
  - `additional_comments`: Comentários adicionais

**Script de Criação:**
```bash
# Execute o script SQL no seu banco Supabase:
psql -h [HOST] -U [USER] -d [DATABASE] -f create_fiscal_feedbacks_table.sql
```

### 2. APIs Criadas/Atualizadas

#### **`/api/students/fiscal-appointments` (GET, PUT)**
- **GET**: Busca atendimentos fiscais do estudante logado
- **PUT**: Atualiza status do atendimento (iniciar/finalizar)
- Autenticação: Bearer Token (estudante)

Exemplo de uso:
```javascript
// Buscar atendimentos
const response = await fetch('/api/students/fiscal-appointments', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// Iniciar atendimento
await fetch('/api/students/fiscal-appointments', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    appointmentId: 'uuid',
    status: 'EM_ANDAMENTO'
  })
})
```

#### **`/api/fiscal-appointments/feedback` (POST, GET)**
- **POST**: Salva feedback de atendimento concluído
- **GET**: Busca feedbacks por atendimento ou estudante
- Sem autenticação necessária para POST (cliente público)

Exemplo de uso:
```javascript
// Enviar feedback
await fetch('/api/fiscal-appointments/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    appointment_id: 'uuid',
    client_name: 'Nome do Cliente',
    client_email: 'email@example.com',
    rating: 5,
    feedback_text: 'Ótimo atendimento!',
    service_quality: 5,
    student_attention: 5,
    problem_resolution: 5,
    would_recommend: true
  })
})
```

#### **`/api/coordinator/student-fiscal-history` (GET)**
- Busca histórico completo de atendimentos e feedbacks de um estudante
- Inclui estatísticas e média de avaliações
- Autenticação: Coordenador

Exemplo de uso:
```javascript
const response = await fetch('/api/coordinator/student-fiscal-history?student_id=uuid')
const data = await response.json()
// Retorna: { student, appointments, stats, feedbacks }
```

### 3. Componentes Frontend

#### **FiscalAppointmentsManager**
Localização: `/src/components/student/FiscalAppointmentsManager.tsx`

Componente principal para o painel do estudante que exibe:
- Lista de atendimentos fiscais atribuídos
- Estatísticas (total, pendentes, em andamento, concluídos)
- Botões para iniciar/finalizar atendimentos
- Modal de detalhes do atendimento

Uso:
```jsx
import FiscalAppointmentsManager from '@/components/student/FiscalAppointmentsManager'

// No painel do estudante
<FiscalAppointmentsManager />
```

#### **FeedbackModal**
Localização: `/src/components/student/FeedbackModal.tsx`

Modal que aparece automaticamente quando um atendimento é finalizado, permitindo que o cliente avalie:
- Avaliação geral com estrelas
- Qualidade do serviço
- Atenção do estudante
- Resolução do problema
- Comentários e recomendação

Uso:
```jsx
import FeedbackModal from '@/components/student/FeedbackModal'

<FeedbackModal
  appointment={appointmentData}
  onClose={() => setShowModal(false)}
/>
```

#### **FiscalAppointmentsSection (Atualizado)**
Localização: `/src/components/FiscalAppointmentsSection.tsx`

Componente do painel do coordenador que agora exibe:
- Histórico de atendimentos por estudante
- Feedbacks recebidos por cada atendimento
- Média de avaliações do estudante
- Estatísticas de desempenho

### 4. Fluxo Completo de Atendimento

1. **Coordenador atribui atendimento ao estudante**
   - Status: `CONFIRMADO`

2. **Estudante visualiza atendimentos no painel**
   - Acessa "Atendimentos Fiscais"
   - Vê lista de atendimentos atribuídos

3. **Estudante inicia atendimento**
   - Clica em "Iniciar Atendimento"
   - Status muda para `EM_ANDAMENTO`
   - Timestamp `scheduled_at` é registrado

4. **Estudante finaliza atendimento**
   - Clica em "Finalizar Atendimento"
   - Status muda para `CONCLUIDO`
   - Timestamp `completed_at` é registrado
   - Modal de feedback é exibido para o cliente

5. **Cliente avalia o atendimento**
   - Preenche formulário de feedback
   - Avalia com estrelas (1-5)
   - Deixa comentários (opcional)
   - Feedback é salvo no banco

6. **Coordenador monitora desempenho**
   - Acessa histórico do estudante
   - Visualiza feedbacks recebidos
   - Verifica média de avaliações
   - Acompanha estatísticas de atendimentos

## Estrutura de Dados

### Status de Atendimento
- `PENDENTE`: Aguardando confirmação
- `CONFIRMADO`: Atribuído ao estudante
- `EM_ANDAMENTO`: Atendimento em execução
- `CONCLUIDO`: Atendimento finalizado
- `CANCELADO`: Atendimento cancelado

### Níveis de Urgência
- `BAIXA`: Baixa prioridade
- `NORMAL`: Prioridade normal
- `ALTA`: Alta prioridade
- `URGENTE`: Urgência máxima

## Integração no Painel do Estudante

Para integrar o componente no painel do estudante (`/src/app/student-portal/page.tsx`):

```jsx
// 1. Importar o componente
import FiscalAppointmentsManager from '@/components/student/FiscalAppointmentsManager'

// 2. Adicionar na lista de tabs
{
  value: 'fiscal-appointments',
  label: 'Atendimentos Fiscais',
  description: 'Gerencie seus atendimentos fiscais',
  icon: Calculator
}

// 3. Adicionar o TabsContent
<TabsContent value="fiscal-appointments">
  <FiscalAppointmentsManager />
</TabsContent>
```

## Testes

### Testar Fluxo Completo

1. **Criar Atendimento Fiscal**
```bash
curl -X POST http://localhost:3000/api/fiscal-appointments \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "João Silva",
    "clientEmail": "joao@example.com",
    "clientPhone": "11999999999",
    "serviceType": "IRPF",
    "serviceTitle": "Declaração de Imposto de Renda",
    "serviceCategory": "Tributos",
    "addressCity": "São Paulo",
    "addressState": "SP",
    "urgencyLevel": "NORMAL"
  }'
```

2. **Atribuir ao Estudante** (via painel do coordenador)

3. **Buscar Atendimentos do Estudante**
```bash
curl http://localhost:3000/api/students/fiscal-appointments \
  -H "Authorization: Bearer [STUDENT_TOKEN]"
```

4. **Iniciar Atendimento**
```bash
curl -X PUT http://localhost:3000/api/students/fiscal-appointments \
  -H "Authorization: Bearer [STUDENT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "[UUID]",
    "status": "EM_ANDAMENTO"
  }'
```

5. **Finalizar Atendimento**
```bash
curl -X PUT http://localhost:3000/api/students/fiscal-appointments \
  -H "Authorization: Bearer [STUDENT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "[UUID]",
    "status": "CONCLUIDO"
  }'
```

6. **Enviar Feedback**
```bash
curl -X POST http://localhost:3000/api/fiscal-appointments/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "[UUID]",
    "client_name": "João Silva",
    "client_email": "joao@example.com",
    "rating": 5,
    "feedback_text": "Excelente atendimento!",
    "service_quality": 5,
    "student_attention": 5,
    "problem_resolution": 5,
    "would_recommend": true
  }'
```

## Monitoramento e Métricas

O coordenador pode visualizar:
- Total de atendimentos por estudante
- Taxa de conclusão
- Média de avaliações
- Feedbacks detalhados
- Desempenho por categoria de serviço

## Próximos Passos Sugeridos

1. **Notificações**
   - Enviar email ao cliente quando atendimento for concluído
   - Notificar coordenador sobre novos feedbacks

2. **Relatórios**
   - Exportar relatório de atendimentos em Excel/PDF
   - Gráficos de desempenho do estudante

3. **Gamificação**
   - Sistema de pontos por feedbacks positivos
   - Badges para estudantes com alta avaliação

4. **Link de Feedback Direto**
   - Gerar link único para cliente avaliar
   - Enviar por email/SMS após conclusão

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confira se a tabela `fiscal_appointment_feedbacks` foi criada
3. Valide as permissões do Supabase
4. Teste as APIs individualmente

## Changelog

**Versão 1.0 - 03/10/2025**
- ✅ Criação da tabela de feedbacks
- ✅ APIs de atendimentos fiscais
- ✅ API de feedbacks
- ✅ Componente FiscalAppointmentsManager
- ✅ Componente FeedbackModal
- ✅ Integração no painel do coordenador
- ✅ Testes de integração
