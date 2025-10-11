# 🚀 Quick Start - Responsividade dos Dashboards

## ⚡ Teste Agora!

1. **Inicie o servidor**:
```bash
npm run dev
```

2. **Acesse a página de demonstração**:
```
http://localhost:4000/test-responsive
```

3. **Teste a responsividade**:
   - Redimensione a janela do navegador
   - Ou use DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)
   - Teste diferentes tamanhos:
     - 📱 Mobile: 375px (iPhone)
     - 📱 Tablet: 768px (iPad)
     - 💻 Desktop: 1440px

## 📦 Componentes Criados

### 1. ResponsiveDashboardLayout
Layout completo com sidebar, header e navegação responsiva

**Localização**: `src/components/layout/ResponsiveDashboardLayout.tsx`

### 2. ResponsiveStatsCard
Cards de estatísticas com ícones, cores e tendências

**Localização**: `src/components/dashboard/ResponsiveStatsCard.tsx`

### 3. ResponsiveGrid
Grid adaptativo para diferentes números de colunas

**Localização**: `src/components/dashboard/ResponsiveGrid.tsx`

### 4. Sheet (Drawer Mobile)
Componente de sidebar para mobile

**Localização**: `src/components/ui/sheet.tsx`

## 🎯 Como Aplicar

### Exemplo Mínimo:

```tsx
import ResponsiveDashboardLayout from '@/components/layout/ResponsiveDashboardLayout'
import ResponsiveStatsCard from '@/components/dashboard/ResponsiveStatsCard'
import ResponsiveGrid from '@/components/dashboard/ResponsiveGrid'
import { Home, Users } from 'lucide-react'

export default function MyDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <ResponsiveDashboardLayout
      title="Meu Dashboard"
      subtitle="Sistema NAF"
      userEmail="email@exemplo.com"
      userName="Nome Usuário"
      navItems={[
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'users', label: 'Usuários', icon: Users, badge: 5 }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={() => console.log('Logout')}
      notifications={3}
    >
      <ResponsiveGrid cols={4}>
        <ResponsiveStatsCard
          title="Total"
          value="1,234"
          icon={Users}
          color="blue"
        />
      </ResponsiveGrid>
    </ResponsiveDashboardLayout>
  )
}
```

## 📐 Breakpoints

| Tamanho | Largura | Colunas |
|---------|---------|---------|
| Mobile  | 0-640px | 1       |
| Tablet  | 640-1024px | 2-3  |
| Desktop | 1024px+ | 3-4     |

## ✅ Características

✨ **Design Profissional**
- Gradientes sutis
- Sombras elegantes
- Transições suaves
- Hover effects

📱 **Mobile First**
- Menu hambúrguer
- Touch-friendly (44px mínimo)
- Scroll suave
- Otimizado para telas pequenas

🎨 **Cores Disponíveis**
- `blue` - Azul (padrão)
- `green` - Verde (sucesso)
- `purple` - Roxo
- `orange` - Laranja (alerta)
- `red` - Vermelho (erro)
- `indigo` - Índigo

## 📚 Documentação Completa

Veja o guia completo em: **`RESPONSIVE_DASHBOARD_GUIDE.md`**

## 🔧 Próximos Passos

1. ✅ Teste a página `/test-responsive`
2. ⏭️ Aplique nos painéis existentes:
   - `/student-portal`
   - `/coordinator-dashboard`
3. ⏭️ Personalize cores e layouts

## 💡 Dica Rápida

Para ver todos os tamanhos de uma vez, use o responsive mode do DevTools e selecione "Responsive" para redimensionar livremente!

---

**Sistema NAF Estácio Florianópolis**
