# Guia de Responsividade dos Dashboards

Este guia explica como utilizar os novos componentes responsivos criados para tornar os painéis do estudante e coordenador mais profissionais, elegantes e funcionais.

## 📱 Componentes Criados

### 1. ResponsiveDashboardLayout
**Localização**: `src/components/layout/ResponsiveDashboardLayout.tsx`

Layout completo responsivo para dashboards com:
- ✅ Sidebar lateral para desktop (fixo)
- ✅ Menu hambúrguer para mobile
- ✅ Header com informações do usuário
- ✅ Sistema de notificações
- ✅ Navegação por abas
- ✅ Dropdown de configurações
- ✅ Transições suaves

#### Como Usar:

```tsx
import ResponsiveDashboardLayout from '@/components/layout/ResponsiveDashboardLayout'
import { Home, BarChart3, Users, Settings } from 'lucide-react'

function MeuDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 5 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ]

  return (
    <ResponsiveDashboardLayout
      title="Painel do Estudante"
      subtitle="Sistema NAF"
      userEmail="estudante@email.com"
      userName="João Silva"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={() => router.push('/logout')}
      notifications={3}
    >
      {/* Seu conteúdo aqui */}
      <div>Conteúdo do dashboard</div>
    </ResponsiveDashboardLayout>
  )
}
```

### 2. ResponsiveStatsCard
**Localização**: `src/components/dashboard/ResponsiveStatsCard.tsx`

Card de estatística responsivo com:
- ✅ Ícone colorido
- ✅ Título e valor grande
- ✅ Indicador de tendência (opcional)
- ✅ Cores customizáveis
- ✅ Efeitos hover elegantes

#### Como Usar:

```tsx
import ResponsiveStatsCard from '@/components/dashboard/ResponsiveStatsCard'
import { Users, TrendingUp } from 'lucide-react'

<ResponsiveStatsCard
  title="Total de Atendimentos"
  value="1,234"
  subtitle="Este mês"
  icon={Users}
  color="blue"
  trend={{ value: 12, label: 'vs mês anterior', positive: true }}
/>
```

**Cores disponíveis**: `blue`, `green`, `purple`, `orange`, `red`, `indigo`

### 3. ResponsiveGrid
**Localização**: `src/components/dashboard/ResponsiveGrid.tsx`

Grid responsivo otimizado para dashboards:
- ✅ Adapta automaticamente o número de colunas
- ✅ Mobile-first design
- ✅ Gaps configuráveis

#### Como Usar:

```tsx
import ResponsiveGrid from '@/components/dashboard/ResponsiveGrid'

{/* Grid de 4 colunas no desktop, 2 no tablet, 1 no mobile */}
<ResponsiveGrid cols={4} gap="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
  <Card>Item 4</Card>
</ResponsiveGrid>

{/* Grid de 3 colunas */}
<ResponsiveGrid cols={3} gap="lg">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</ResponsiveGrid>
```

**Opções de colunas**: `1`, `2`, `3`, `4`, `6`
**Opções de gap**: `sm`, `md`, `lg`

## 📐 Breakpoints Utilizados

O sistema segue o padrão Tailwind CSS:

| Dispositivo | Breakpoint | Largura     | Comportamento                    |
|-------------|-----------|-------------|----------------------------------|
| Mobile      | `default` | 0-640px     | 1 coluna, sidebar oculto         |
| Tablet      | `sm:`     | 640-1024px  | 2-3 colunas, sidebar oculto      |
| Desktop     | `lg:`     | 1024px+     | 3-4 colunas, sidebar visível     |

## 🎨 Características de Design

### Cores e Gradientes
- Uso de gradientes sutis para profissionalismo
- Paleta consistente com a identidade NAF
- Suporte a dark mode

### Transições
- Animações suaves (200-300ms)
- Efeitos hover elegantes
- Transições de estado suaves

### Espaçamento
- Sistema de espaçamento consistente
- Padding responsivo (menor em mobile)
- Gaps adaptativos

### Tipografia
- Tamanhos responsivos de texto
- Hierarquia clara
- Truncagem de texto longo

## 🧪 Página de Teste

Criamos uma página completa de teste em: `/test-responsive`

### Como Testar:

1. **Iniciar o servidor**:
   ```bash
   npm run dev
   ```

2. **Acessar a página de teste**:
   ```
   http://localhost:4000/test-responsive
   ```

3. **Testar responsividade**:
   - Redimensione a janela do navegador
   - Use DevTools (F12) → Device Toolbar (Ctrl+Shift+M)
   - Teste em diferentes dispositivos:
     - iPhone SE (375px)
     - iPhone 12 Pro (390px)
     - iPad (768px)
     - iPad Pro (1024px)
     - Desktop (1440px+)

### O que a página de teste inclui:

✅ **Stats Cards** - 4 cards de estatísticas
✅ **Two Column Layout** - Gráficos lado a lado
✅ **Three Column Layout** - Cards de atividades
✅ **Full Width Table** - Tabela responsiva
✅ **Progress Bars** - Indicadores de progresso
✅ **Badges** - Etiquetas de status
✅ **Mobile Navigation** - Menu hambúrguer
✅ **Desktop Sidebar** - Navegação lateral
✅ **Notificações** - Sistema de badges

## 🔧 Como Aplicar nos Painéis Existentes

### Painel do Estudante (`/student-portal`)

1. **Importar o layout**:
```tsx
import ResponsiveDashboardLayout from '@/components/layout/ResponsiveDashboardLayout'
import ResponsiveStatsCard from '@/components/dashboard/ResponsiveStatsCard'
import ResponsiveGrid from '@/components/dashboard/ResponsiveGrid'
```

2. **Envolver o conteúdo**:
```tsx
return (
  <ResponsiveDashboardLayout
    title="Portal do Estudante"
    subtitle="Sistema NAF"
    userEmail={user?.email || ''}
    userName={user?.name || ''}
    navItems={navItems}
    activeTab={selectedTab}
    onTabChange={setSelectedTab}
    onLogout={handleLogout}
    notifications={notifications}
  >
    {/* Conteúdo existente aqui */}
  </ResponsiveDashboardLayout>
)
```

3. **Substituir grids**:
```tsx
{/* ANTES */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  {/* cards */}
</div>

{/* DEPOIS */}
<ResponsiveGrid cols={4} gap="md">
  {/* cards */}
</ResponsiveGrid>
```

4. **Usar Stats Cards**:
```tsx
{/* ANTES */}
<Card>
  <CardHeader>
    <CardTitle>{stat.label}</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl">{stat.value}</div>
  </CardContent>
</Card>

{/* DEPOIS */}
<ResponsiveStatsCard
  title={stat.label}
  value={stat.value}
  icon={stat.icon}
  color="blue"
/>
```

### Painel do Coordenador (`/coordinator-dashboard`)

Mesma abordagem do painel do estudante, adaptando:
- Título: "Dashboard Coordenador"
- Nav items específicos do coordenador
- Stats específicos (total de estudantes, atendimentos supervisionados, etc.)

## 📱 Checklist de Responsividade

Use este checklist ao implementar:

### Mobile (< 640px)
- [ ] Menu hambúrguer funcionando
- [ ] Cards empilhados verticalmente (1 coluna)
- [ ] Texto legível (tamanho mínimo 14px)
- [ ] Botões com tamanho mínimo touch-friendly (44px)
- [ ] Tabelas com scroll horizontal
- [ ] Imagens redimensionadas
- [ ] Espaçamento adequado (mínimo 16px padding)

### Tablet (640-1024px)
- [ ] 2-3 colunas em grids
- [ ] Sidebar ainda oculto
- [ ] Layout otimizado para landscape
- [ ] Cards agrupados de forma lógica

### Desktop (> 1024px)
- [ ] Sidebar fixo visível
- [ ] 3-4 colunas em grids
- [ ] Uso eficiente do espaço horizontal
- [ ] Hover effects visíveis
- [ ] Tooltips e dropdowns funcionando

## 🎯 Melhores Práticas

### 1. **Mobile First**
Sempre pense primeiro na experiência mobile:
```tsx
// BOM
<div className="text-sm sm:text-base lg:text-lg">

// RUIM
<div className="text-lg sm:text-sm">
```

### 2. **Touch Targets**
Botões e links devem ter no mínimo 44x44px em mobile:
```tsx
<Button size="sm" className="min-h-[44px] min-w-[44px] lg:min-h-0 lg:min-w-0">
```

### 3. **Scroll Horizontal**
Use com moderação e indique visualmente:
```tsx
<div className="overflow-x-auto">
  <table className="min-w-[600px]">
    {/* conteúdo */}
  </table>
</div>
```

### 4. **Ocultar Elementos**
Use classes Tailwind para mostrar/ocultar:
```tsx
{/* Oculto em mobile, visível em desktop */}
<div className="hidden lg:block">Desktop only</div>

{/* Visível em mobile, oculto em desktop */}
<div className="block lg:hidden">Mobile only</div>
```

### 5. **Imagens Responsivas**
```tsx
<img
  src="/image.jpg"
  className="w-full h-auto max-w-md lg:max-w-lg"
  alt="Descrição"
/>
```

## 🐛 Troubleshooting

### Sidebar não abre em mobile
**Problema**: Menu hambúrguer não funciona
**Solução**: Verificar se `@radix-ui/react-dialog` está instalado:
```bash
npm install @radix-ui/react-dialog
```

### Layout quebrado em mobile
**Problema**: Conteúdo ultrapassando a tela
**Solução**: Adicionar `overflow-x-hidden` no container principal

### Cards muito pequenos em desktop
**Problema**: Cards com largura fixa
**Solução**: Usar `ResponsiveGrid` ao invés de largura fixa

### Texto cortado
**Problema**: Texto longo sem quebra
**Solução**: Adicionar `truncate` ou `break-words`:
```tsx
<p className="truncate">Texto muito longo...</p>
<p className="break-words">Texto que pode quebrar em várias linhas</p>
```

## 📚 Recursos Adicionais

- [Tailwind CSS Breakpoints](https://tailwindcss.com/docs/responsive-design)
- [Radix UI Components](https://www.radix-ui.com/)
- [Mobile-First Design](https://www.lukew.com/ff/entry.asp?933)

## 🔄 Próximos Passos

1. **Aplicar nos painéis existentes**:
   - [ ] Atualizar `/student-portal`
   - [ ] Atualizar `/coordinator-dashboard`

2. **Testar em dispositivos reais**:
   - [ ] iPhone
   - [ ] Android
   - [ ] iPad
   - [ ] Desktop

3. **Otimizações**:
   - [ ] Lazy loading de componentes pesados
   - [ ] Virtual scrolling para listas longas
   - [ ] Cache de dados

4. **Acessibilidade**:
   - [ ] Navegação por teclado
   - [ ] Screen reader support
   - [ ] Contraste adequado
   - [ ] ARIA labels

## 💡 Exemplos de Uso

### Dashboard Completo

```tsx
'use client'

import { useState } from 'react'
import ResponsiveDashboardLayout from '@/components/layout/ResponsiveDashboardLayout'
import ResponsiveStatsCard from '@/components/dashboard/ResponsiveStatsCard'
import ResponsiveGrid from '@/components/dashboard/ResponsiveGrid'
import { Home, Users, Calendar, Settings } from 'lucide-react'

export default function MyDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Usuários', icon: Users, badge: 12 },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ]

  return (
    <ResponsiveDashboardLayout
      title="Meu Dashboard"
      subtitle="Sistema Profissional"
      userEmail="usuario@email.com"
      userName="Nome do Usuário"
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={() => console.log('Logout')}
      notifications={5}
    >
      <div className="space-y-6">
        <ResponsiveGrid cols={4}>
          <ResponsiveStatsCard
            title="Total"
            value="1,234"
            icon={Users}
            color="blue"
          />
          <ResponsiveStatsCard
            title="Concluídos"
            value="987"
            icon={Calendar}
            color="green"
            trend={{ value: 12, label: 'aumento', positive: true }}
          />
        </ResponsiveGrid>

        {/* Mais conteúdo aqui */}
      </div>
    </ResponsiveDashboardLayout>
  )
}
```

---

**Criado para o Sistema NAF Estácio Florianópolis**
Data: Outubro 2025
