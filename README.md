# 🏪 Bazari - Super App Web3

**Economia descentralizada para todos**

Bazari é um Super App Web3 descentralizado focado no mercado informal brasileiro, oferecendo tokenização de perfis, marketplace, DAO, DEX e protocolo de trabalho descentralizado.

## 🚀 Status do Projeto

**✅ Etapa 1 Concluída:** Fundação e Configuração Base
- Setup React + Vite + TailwindCSS
- Design System com paleta oficial
- Layout responsivo
- Sistema de internacionalização (PT/EN/ES)
- Componentes base funcionais

**🔄 Próximas Etapas:**
- Etapa 2: Módulo de Acesso e Autenticação
- Etapa 3: Perfil Tokenizado
- Etapa 4: Carteira (Wallet)

## 🛠️ Stack Tecnológica

- **Frontend:** React 18 + Vite
- **Estilização:** TailwindCSS 3.4.3
- **Animações:** Framer Motion
- **Roteamento:** React Router DOM
- **Estado Global:** Zustand
- **Ícones:** Lucide React
- **Internacionalização:** Sistema customizado

## 🎨 Design System

### Paleta de Cores Oficial
- **Primária:** `#8B0000` - Vermelho terroso (resistência e povo)
- **Secundária:** `#FFB300` - Dourado queimado (riqueza e esperança)
- **Fundo escuro:** `#1C1C1C` - Preto fosco (descentralização e poder)
- **Fundo claro:** `#F5F1E0` - Areia clara (simplicidade, papel e rua)

### Componentes Disponíveis
- **Button:** Variantes (primary, secondary, outline, ghost)
- **Input:** Com suporte a senha e validação
- **Card:** Para containers de conteúdo
- **Modal:** Para overlays
- **Avatar:** Para perfis de usuário
- **Badge:** Para status e tags
- **Alert:** Para mensagens de feedback
- **Loading:** Para estados de carregamento

## 📁 Estrutura do Projeto

```
bazari-dapp/
├── public/
│   └── index.html
├── src/
│   ├── modules/              # Módulos principais
│   │   ├── acesso/          # Sistema de login/registro
│   │   ├── perfil/          # Perfil tokenizado
│   │   ├── marketplace/     # Marketplace
│   │   ├── wallet/          # Carteira
│   │   ├── dao/             # Governança DAO
│   │   ├── dex/             # Exchange descentralizada
│   │   └── trabalho/        # Protocolo de trabalho
│   ├── components/          # Componentes reutilizáveis
│   ├── layout/              # Layout principal
│   ├── i18n/                # Sistema de internacionalização
│   ├── services/            # Integrações externas
│   ├── adapters/            # Adaptadores de dados
│   ├── config/              # Configurações
│   ├── assets/              # Recursos estáticos
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Ponto de entrada
│   └── index.css            # Estilos globais
├── .env                     # Variáveis de ambiente
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/bazari-dapp.git
cd bazari-dapp
```

2. **Instale as dependências:**
```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

4. **Execute em modo desenvolvimento:**
```bash
npm run dev
# ou
yarn dev
```

5. **Acesse no navegador:**
```
http://localhost:3000
```

### Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
npm run lint     # Análise de código
```

## 🌍 Internacionalização

O app suporta múltiplos idiomas:
- **Português (PT)** - Padrão
- **Inglês (EN)**
- **Espanhol (ES)**

### Como adicionar traduções:

1. Edite `/src/i18n/translations.json`
2. Use o hook `useTranslation()` nos componentes:

```jsx
import { useTranslation } from '@i18n/useTranslation'

const MeuComponente = () => {
  const { t, language, setLanguage } = useTranslation()
  
  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <button onClick={() => setLanguage('en')}>
        English
      </button>
    </div>
  )
}
```

## 📱 Responsividade

O design segue a estratégia **mobile-first**:
- **Mobile:** Design principal otimizado
- **Tablet:** Adaptação com mais espaço
- **Desktop:** Expansão com colunas laterais

### Breakpoints TailwindCSS:
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+
- `2xl`: 1536px+

## 🔧 Configuração Avançada

### Aliases de Importação
```javascript
@components  → ./src/components
@modules     → ./src/modules  
@services    → ./src/services
@layout      → ./src/layout
@i18n        → ./src/i18n
@assets      → ./src/assets
@config      → ./src/config
```

### Exemplo de uso:
```jsx
import { Button } from '@components/BaseComponents'
import { useTranslation } from '@i18n/useTranslation'
import MainLayout from '@layout/MainLayout'
```

## 🎯 Funcionalidades Atuais

### ✅ Implementadas
- [x] Design system completo
- [x] Layout responsivo
- [x] Sistema de internacionalização
- [x] Navegação entre módulos
- [x] Dashboard com métricas
- [x] Componentes base reutilizáveis
- [x] Menu lateral retrátil
- [x] Sistema de notificações
- [x] Tema e paleta oficial

### 🔄 Em Desenvolvimento
- [ ] Sistema de autenticação
- [ ] Perfil tokenizado
- [ ] Carteira Web3
- [ ] Marketplace
- [ ] DAO Governança
- [ ] DEX
- [ ] Protocolo de trabalho

## 🤝 Contribuição

### Como contribuir:

1. **Fork** o projeto
2. **Crie** sua feature branch (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

### Padrões de Código:
- Use **ESLint** para linting
- Siga as convenções do **Prettier**
- Escreva **componentes funcionais** com hooks
- Use **TypeScript** quando possível
- Mantenha **responsividade** em todos os componentes

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Website:** https://bazari.com
- **Email:** contato@bazari.com  
- **Twitter:** [@bazari_app](https://twitter.com/bazari_app)
- **Telegram:** [Bazari Community](https://t.me/bazari_community)
- **Discord:** [Bazari Discord](https://discord.gg/bazari)

---

**Bazari** - *Construindo a economia descentralizada do futuro* 🚀