# 🚀 GUIA RÁPIDO - TESTANDO AS NOVAS FUNCIONALIDADES

## ⚡ Como Testar Rapidamente

### 🔑 1. MUDANÇA DE SENHA (2 minutos)

#### Coordenador:
```
1. Login: https://naf.ltdestacio.com.br
2. Clique na aba: "Segurança Digital"
3. Você verá 2 cards lado a lado:
   - Esquerda: Mudança de Senha/E-mail
   - Direita: Backup Center
4. Na seção de mudança de senha:
   - Digite senha atual
   - Digite nova senha (veja indicador de força)
   - Confirme nova senha
   - Clique "Alterar Senha"
5. Logout e teste novo login
```

#### Estudante:
```
1. Login no portal estudantil
2. Clique na aba: "Perfil"
3. Role até o final da página
4. Você verá o componente "Segurança da Conta"
5. Mesmos passos do coordenador
```

---

### 📚 2. CURSOS EXTERNOS (3 minutos)

#### Coordenador - Gerenciar Cursos:
```
1. Login como coordenador
2. Clique na aba: "Cursos Externos" (nova!)
3. Você verá 3 cursos já cadastrados
4. Clique "Novo Curso":
   - Título: Teste de Curso
   - URL: https://youtube.com
   - Plataforma: YouTube
   - Categoria: Contabilidade
   - Nível: Iniciante
   - Marque "Ativo"
   - Clique "Criar Curso"
5. Verifique na tabela abaixo
6. Teste os botões:
   - 🔗 Abrir link
   - ✏️ Editar
   - 🗑️ Excluir
   - Badge "Ativo/Inativo" (clique para alternar)
```

#### Estudante - Ver Cursos:
```
1. Login como estudante
2. Clique na aba: "Cursos" (nova!)
3. Veja os cards dos cursos disponíveis
4. Teste os filtros:
   - Buscar por nome
   - Filtrar por categoria
   - Filtrar por nível
5. Clique em um card de curso
6. O curso abrirá em nova aba
7. Contador de views aumenta automaticamente
```

---

## 📊 VERIFICANDO ESTATÍSTICAS

### Coordenador:
Na aba "Cursos Externos", role até o final:
- Card azul: Total de cursos
- Card verde: Cursos ativos
- Card roxo: Total de visualizações
- Card laranja: Categorias

### Estudante:
Na aba "Cursos", no rodapé:
- Cursos disponíveis
- Categorias
- Total de acessos
- Plataformas

---

## 🎯 ATALHOS DE NAVEGAÇÃO

### Dashboard Coordenador:
```
Menu Superior → Botões de aba:
- Visão Geral
- Serviços
- Estudantes
- Orient. Fiscais
- Atendimentos
- Usuários Cadastrados
- Histórico
- Chat
- Business Intelligence
- Segurança Digital ← MUDANÇA DE SENHA AQUI
- **Cursos Externos** ← NOVA ABA!
- Perigo
- Automação Fiscal
- Domínio NAF
- Relatórios
- Fazer Backup
```

### Portal Estudante:
```
Menu Superior → Botões de aba:
- Dashboard
- Atendimentos Fiscais
- Treinamentos
- **Cursos** ← NOVA ABA!
- Analytics
- Relatórios
- Perfil ← MUDANÇA DE SENHA AQUI
- Chat
- Assistente IA
```

---

## ✅ CHECKLIST DE TESTES

### Mudança de Senha:
- [ ] Senha atual validada corretamente
- [ ] Indicador de força funciona (5 níveis)
- [ ] Requisitos aparecem (maiúscula, número, etc)
- [ ] Confirmação de senha valida
- [ ] Mensagem de sucesso aparece
- [ ] Logout e login com nova senha funciona

### Mudança de E-mail:
- [ ] Aba "Alterar E-mail" funciona
- [ ] E-mail atual aparece desabilitado
- [ ] Validação de formato funciona
- [ ] Mensagem sobre confirmação aparece
- [ ] E-mail de confirmação enviado (checar inbox)

### Cursos - Coordenador:
- [ ] Lista de cursos carrega
- [ ] Botão "Novo Curso" abre formulário
- [ ] Criar curso funciona
- [ ] Editar curso funciona
- [ ] Excluir curso pede confirmação
- [ ] Status ativo/inativo alterna
- [ ] Link externo abre em nova aba
- [ ] Estatísticas corretas no footer

### Cursos - Estudante:
- [ ] Cards de cursos aparecem
- [ ] Busca por texto funciona
- [ ] Filtro por categoria funciona
- [ ] Filtro por nível funciona
- [ ] Botão "Limpar Filtros" funciona
- [ ] Clicar no card abre curso
- [ ] Contador de views aumenta
- [ ] Apenas cursos ativos aparecem
- [ ] Estatísticas corretas no footer

---

## 🐛 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### "Erro ao carregar cursos"
**Solução**: Verifique se as tabelas foram criadas no Supabase
```sql
SELECT * FROM external_courses;
SELECT * FROM password_changes;
```

### "Senha não altera"
**Solução**: Verifique console do navegador (F12) para erros
Pode ser problema de autenticação do Supabase

### "Cursos não aparecem para estudante"
**Solução**: Certifique-se que os cursos estão marcados como `is_active = true`
No coordenador, clique no badge de status para ativar

### "Contador de views não aumenta"
**Solução**: É esperado - o contador só aumenta quando estudante clica no card
Verifique no coordenador se o número está mudando

---

## 🎨 VISUAL ESPERADO

### PasswordChangeForm:
- Tabs azuis no topo (Alterar Senha | Alterar E-mail)
- Campos com ícones de cadeado
- Botões de olho para mostrar/ocultar senha
- Barra de força com 5 níveis coloridos
- Checklist de requisitos com ✓ verdes
- Avisos em amarelo
- Sucesso em verde
- Erros em vermelho

### ExternalCoursesManager:
- Botão azul "Novo Curso" no canto superior direito
- Formulário inline com campos organizados em grid 2 colunas
- Tabela com linhas hover cinza claro
- Badges coloridos (verde/amarelo/vermelho)
- 4 cards de estatísticas com gradientes vibrantes
- Icons de ação (editar, excluir, link)

### ExternalCoursesViewer:
- Barra de busca grande no topo
- 3 dropdowns de filtro lado a lado
- Grid de cards 3 colunas (responsive: 1 coluna mobile, 2 tablet, 3 desktop)
- Cards com sombra e elevação no hover
- Thumbnails com zoom suave
- Badges coloridos por categoria/nível
- Footer do card com duração e views
- Rodapé com 4 estatísticas centralizadas

---

## 📱 TESTE RESPONSIVO

### Desktop (> 1024px):
- Grid 3 colunas para cursos
- Formulário 2 colunas
- Todos elementos visíveis

### Tablet (768px - 1024px):
- Grid 2 colunas para cursos
- Formulário mantém 2 colunas
- Menu de tabs pode scrollar

### Mobile (< 768px):
- Grid 1 coluna para cursos
- Formulário 1 coluna
- Menu de tabs scroll horizontal
- Cards ocupam largura total

**Teste redimensionando a janela do navegador!**

---

## 🎉 SUCESSO!

Se todos os checkboxes acima foram marcados, **PARABÉNS!** 🎊

**Todas as funcionalidades estão funcionando perfeitamente!**

---

**Última atualização:** 26/10/2025  
**Tempo estimado de teste:** 10 minutos  
**Nível de dificuldade:** Fácil 🟢
