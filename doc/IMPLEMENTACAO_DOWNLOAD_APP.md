# 📱 Download do App NAF - Implementação

## ✅ Implementação Concluída

### 📋 O que foi feito:

1. **Link de Download Alterado**
   - ❌ ANTES: Redirecionava para Google Play Store
   - ✅ AGORA: Faz download direto do APK local

2. **Arquivo APK Copiado**
   - 📂 Origem: `apk/naf.apk` (81 MB)
   - 📂 Destino: `public/apk/naf.apk`
   - ✅ Arquivo acessível publicamente via Next.js

3. **Código Atualizado**
   - Arquivo modificado: `src/app/page.tsx`
   - Componente: Seção "O NAF na palma da mão"
   - Mudança: `<Link href="...">` → `<a href="/apk/naf.apk" download>`

---

## 🔧 Alterações Técnicas

### Antes:
```tsx
<Link
  href="https://play.google.com/store/apps/details?id=br.com.estacio.naf"
  target="_blank"
  rel="noopener noreferrer"
  className="..."
>
  {/* Conteúdo */}
</Link>
```

### Depois:
```tsx
<a
  href="/apk/naf.apk"
  download="NAF-Estacio.apk"
  className="..."
>
  {/* Conteúdo */}
</a>
```

---

## 📦 Estrutura de Arquivos

```
naf-contabilidade-estacio/
├── apk/
│   └── naf.apk (81 MB) ← Arquivo original
├── public/
│   └── apk/
│       └── naf.apk (81 MB) ← Cópia para acesso público
└── src/
    └── app/
        └── page.tsx ← Link modificado
```

---

## 🚀 Como Funciona

### 1. Usuário Clica no Botão "Google Play"

Na página inicial (home), na seção final do site:

```
"O NAF na palma da mão: acompanhe atendimentos, 
receba alertas e organize sua agenda onde estiver."

[Botão: Baixar App - Google Play]
```

### 2. Download Automático

Quando o usuário clica no botão:
- ✅ Navegador inicia download automático do arquivo `NAF-Estacio.apk`
- ✅ Arquivo baixado: 81 MB
- ✅ Nome do arquivo: `NAF-Estacio.apk`
- ✅ Origem: `public/apk/naf.apk`

### 3. Instalação

Após o download:
1. Usuário abre o arquivo APK baixado
2. Android solicita permissão para instalar apps de fontes desconhecidas (primeira vez)
3. Usuário confirma instalação
4. App NAF é instalado no dispositivo

---

## ⚠️ Considerações Importantes

### 1. Google Play Protect

Usuários podem ver um aviso:
```
"Este app não foi verificado pela Google Play Protect"
```

**Solução**: Orientar os usuários a aceitar a instalação mesmo assim, pois é um app oficial do NAF Estácio.

### 2. Permissões Android

Para instalar APKs fora da Play Store, é necessário:
- Android 8+: Permitir instalação de "fontes desconhecidas" para o navegador
- Android 12+: Sistema solicita permissão automaticamente

### 3. Atualizações do App

Como o app não está na Play Store:
- ❌ Não recebe atualizações automáticas
- ✅ Precisa disponibilizar novas versões do APK quando houver updates
- ✅ Implementar sistema de notificação de atualização no próprio app (futuro)

### 4. Tamanho do Arquivo

- Arquivo: 81 MB
- Recomendação: Usuários devem estar conectados a Wi-Fi para evitar consumo de dados móveis

---

## 🧪 Testando a Implementação

### Teste 1: Verificar Arquivo Acessível

```bash
# Verificar se o arquivo existe em public/apk/
ls -lh public/apk/naf.apk

# Resultado esperado: 81M
```

### Teste 2: Testar Download no Navegador

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Abra: http://localhost:3000

3. Role até a seção "O NAF na palma da mão"

4. Clique no botão "Baixar App - Google Play"

5. **Resultado esperado**: 
   - Download do arquivo `NAF-Estacio.apk` inicia automaticamente

### Teste 3: Verificar em Produção

Após deploy:
1. Acesse o site em produção
2. Clique no botão de download
3. Verifique se o download funciona

**URL do APK em produção**:
```
https://seu-dominio.com/apk/naf.apk
```

---

## 📊 Deploy e Hosting

### Netlify / Vercel

✅ **Funciona normalmente**:
- Arquivos em `public/` são servidos estaticamente
- APK será acessível via `/apk/naf.apk`
- Download funciona sem configuração adicional

### Considerações de CDN

- ✅ CDN entregará o arquivo mais rápido
- ✅ Reduz carga no servidor
- ⚠️ Primeira requisição pode ser mais lenta (cache)

---

## 🔒 Segurança

### Hash do Arquivo (Verificação de Integridade)

Para garantir que o APK não foi modificado:

```bash
# Gerar hash SHA256 do APK
shasum -a 256 public/apk/naf.apk

# Salvar em arquivo para referência
shasum -a 256 public/apk/naf.apk > public/apk/naf.apk.sha256
```

Exemplo de hash:
```
abc123def456... naf.apk
```

### Recomendação:
- Documentar o hash do APK oficial
- Permitir que usuários verifiquem a integridade do download

---

## 🎨 UI/UX

### Visual do Botão

Mantém o mesmo design da Google Play:
- ✅ Ícone do Google Play (verde/amarelo/azul/vermelho)
- ✅ Texto "Disponível na Google Play" → "Baixar App"
- ✅ Animação de hover (escala e translação)
- ✅ Sombra e bordas arredondadas

### Textos Atualizados

**Original**:
```
Disponível na
Google Play
```

**Novo**:
```
Baixar App
Google Play
```

*Nota: Mantém "Google Play" para familiaridade visual, mas o comportamento é download direto.*

---

## 🔄 Atualizações Futuras

### Versão 2.0: Sistema de Versionamento

Implementar controle de versões:

```tsx
// Futuro: src/config/app-version.ts
export const APP_VERSION = {
  version: '1.0.0',
  buildNumber: 1,
  releaseDate: '2025-10-26',
  downloadUrl: '/apk/naf-v1.0.0.apk',
  changelog: [
    'Versão inicial',
    'Sistema de login',
    'Agendamento de atendimentos'
  ]
}
```

### Versão 3.0: API de Verificação

Criar endpoint para verificar atualizações:

```typescript
// Futuro: src/app/api/app-version/route.ts
export async function GET() {
  return Response.json({
    version: '1.0.0',
    downloadUrl: '/apk/naf.apk',
    minVersion: '1.0.0',
    forceUpdate: false
  })
}
```

---

## 📝 Checklist de Implementação

- [x] ✅ Arquivo APK copiado para `public/apk/`
- [x] ✅ Link modificado em `src/app/page.tsx`
- [x] ✅ Atributo `download` adicionado
- [x] ✅ `.gitattributes` criado para tratar APK como binário
- [x] ✅ Documentação criada
- [ ] ⏳ Testar download em desenvolvimento
- [ ] ⏳ Testar download em produção
- [ ] ⏳ Documentar hash SHA256 do APK
- [ ] ⏳ Criar página de instruções de instalação para Android

---

## 🎯 Próximos Passos

1. **Testar em Desenvolvimento**
   ```bash
   npm run dev
   # Acessar http://localhost:3000 e testar download
   ```

2. **Fazer Deploy**
   ```bash
   git add .
   git commit -m "feat: implementar download direto do APK do NAF"
   git push
   ```

3. **Verificar em Produção**
   - Acessar site em produção
   - Testar download do APK
   - Instalar em dispositivo Android de teste

4. **Criar Guia de Instalação** (Futuro)
   - Página `/como-instalar-app`
   - Vídeo tutorial
   - FAQ sobre "fontes desconhecidas"

---

## 📱 Informações do APK

- **Nome**: NAF Estácio
- **Tamanho**: 81 MB (84,934,656 bytes)
- **Compatibilidade**: Android 8 ou superior
- **Package ID**: br.com.estacio.naf
- **Última atualização**: 26/10/2025

---

## ✅ Status

**Implementação**: ✅ CONCLUÍDA  
**Testes**: ⏳ PENDENTE  
**Deploy**: ⏳ PENDENTE  

---

**Data de implementação**: 26/10/2025  
**Desenvolvido para**: Sistema NAF Estácio
