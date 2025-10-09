# NAF Contábil - Instruções para Copilot

Este projeto é um sistema web completo para o NAF (Núcleo de Apoio Contábil Fiscal) com as seguintes funcionalidades:

## Características do Projeto
- **Framework**: Next.js 14+ com App Router
- **Linguagem**: TypeScript
- **Estilo**: Tailwind CSS
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: NextAuth.js
- **UI Components**: Shadcn/ui
- **Gráficos**: Chart.js/Recharts
- **Email**: Nodemailer

## Funcionalidades Principais
1. **Sistema de Autenticação**: Login diferenciado para alunos, professores e coordenadores
2. **Dashboard do Coordenador**: Gráficos e estatísticas de cadastros e atendimentos
3. **Cadastro de Serviços**: Gestão dos 21+ serviços fiscais oferecidos pelo NAF
4. **Agendamento**: Sistema de agendamento de atendimentos com notificações por email
5. **Relatórios**: Geração de relatórios de assistências prestadas
6. **Integração**: APIs para formulários externos (Office Forms)

## Estrutura de Usuários
- **Alunos**: Podem se cadastrar para receber assistência
- **Professores**: Podem prestar assistência e gerenciar atendimentos
- **Coordenadores**: Acesso completo com dashboards e relatórios

## Serviços NAF Incluídos
- Cadastro CPF/CNPJ
- Orientações sobre IR, MEI, ITR
- Comércio exterior
- Certidões negativas
- Parcelamento de débitos
- E-Social doméstico
- E mais 15+ serviços fiscais

## Checklist de Desenvolvimento
- [x] Criar workspace e estrutura inicial
- [ ] Configurar Next.js com TypeScript e Tailwind
- [ ] Instalar dependências necessárias
- [ ] Configurar banco de dados e Prisma
- [ ] Implementar sistema de autenticação
- [ ] Criar componentes de UI
- [ ] Desenvolver dashboards e relatórios
- [ ] Implementar sistema de agendamento
- [ ] Configurar envio de emails
- [ ] Integrar APIs externas
