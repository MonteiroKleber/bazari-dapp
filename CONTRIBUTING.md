# 🤝 Guia de Contribuição - Bazari

Obrigado por seu interesse em contribuir com o Ecossistema Bazari! Este documento fornece diretrizes e informações sobre como você pode contribuir com nosso projeto.

## 📋 Código de Conduta

Ao participar deste projeto, você concorda em manter um ambiente respeitoso e inclusivo. Esperamos que todos os contribuidores:

- Usem linguagem acolhedora e inclusiva
- Respeitem diferentes pontos de vista e experiências
- Aceitem críticas construtivas com graça
- Foquem no que é melhor para a comunidade
- Mostrem empatia com outros membros da comunidade

## 🚀 Como Contribuir

### 1. Reportando Bugs

Se você encontrou um bug, por favor:

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/bazari/bazari/issues)
2. Se não, crie uma nova issue com:
   - Título descritivo
   - Passos para reproduzir o problema
   - Comportamento esperado vs. comportamento atual
   - Screenshots (se aplicável)
   - Ambiente (OS, Node version, etc.)

### 2. Sugerindo Melhorias

Adoramos receber sugestões! Para propor uma nova funcionalidade:

1. Verifique se já não existe uma sugestão similar
2. Abra uma issue com tag `enhancement`
3. Descreva claramente:
   - O problema que a feature resolve
   - Como você imagina a solução
   - Exemplos de uso

### 3. Contribuindo com Código

#### Setup Inicial

```bash
# Fork o repositório
# Clone seu fork
git clone https://github.com/seu-usuario/bazari.git
cd bazari

# Adicione o upstream
git remote add upstream https://github.com/bazari/bazari.git

# Instale as dependências
pnpm install

# Configure o ambiente
cp .env.example .env.local

# Inicie os serviços
docker-compose -f infra/docker-compose.dev.yml up -d

# Rode o projeto
pnpm dev
```

#### Fluxo de Trabalho

1. **Crie uma branch** para sua feature/fix:
```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-fix
```

2. **Faça suas alterações** seguindo nossos padrões

3. **Escreva/atualize testes** quando aplicável

4. **Rode os testes** para garantir que tudo passa:
```bash
pnpm test
pnpm lint
```

5. **Commit suas mudanças** usando [Conventional Commits](https://www.conventionalcommits.org/):
```bash
git commit -m "feat: adiciona nova funcionalidade X"
# ou
git commit -m "fix: corrige problema Y"
```

6. **Push para seu fork**:
```bash
git push origin feature/minha-feature
```

7. **Abra um Pull Request** com:
   - Título descritivo
   - Descrição do que foi feito
   - Link para issue relacionada (se houver)
   - Screenshots/GIFs (se aplicável)

## 📝 Padrões de Código

### TypeScript/JavaScript

- Use TypeScript sempre que possível
- Evite `any` - use tipos específicos
- Prefira `const` sobre `let`
- Use arrow functions para callbacks
- Documente funções complexas

```typescript
// ❌ Evite
function processData(data: any) {
  let result = data.value * 2
  return result
}

// ✅ Prefira
/**
 * Processa dados multiplicando o valor por 2
 * @param data - Dados de entrada com valor numérico
 * @returns Valor processado
 */
const processData = (data: { value: number }): number => {
  const result = data.value * 2
  return result
}
```

### React

- Use componentes funcionais com hooks
- Mantenha componentes pequenos e focados
- Use nomes descritivos
- Extraia lógica complexa para custom hooks

```tsx
// ✅ Bom exemplo
const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { user, loading, error } = useUser(userId)
  
  if (loading) return <Loading />
  if (error) return <Error message={error.message} />
  
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      {/* ... */}
    </div>
  )
}
```

### CSS/Tailwind

- Use classes do Tailwind sempre que possível
- Evite estilos inline
- Agrupe classes relacionadas
- Use as variáveis de cores do tema

```tsx
// ❌ Evite
<div style={{ backgroundColor: 'red', padding: '10px' }}>

// ✅ Prefira
<div className="bg-bazari-red p-4 rounded-lg shadow-md">
```

### Commits

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `style:` Formatação, missing semi colons, etc
- `refactor:` Refatoração sem mudança de funcionalidade
- `test:` Adição ou correção de testes
- `chore:` Mudanças no build, configurações, etc

## 🧪 Testes

- Escreva testes para novas funcionalidades
- Mantenha cobertura de testes > 80%
- Use nomes descritivos para os testes
- Teste casos de sucesso e erro

```typescript
describe('UserService', () => {
  it('should create a new user successfully', async () => {
    // ...
  })
  
  it('should throw error when email is invalid', async () => {
    // ...
  })
})
```

## 📚 Documentação

- Atualize o README se necessário
- Documente APIs e funções públicas
- Adicione comentários em código complexo
- Mantenha os exemplos atualizados

## 🏷️ Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- MAJOR: Mudanças incompatíveis na API
- MINOR: Funcionalidades compatíveis com versões anteriores
- PATCH: Correções de bugs compatíveis

## 🎯 Áreas que Precisam de Ajuda

### Desenvolvimento
- [ ] Implementação dos pallets Substrate
- [ ] Integração com carteira nativa
- [ ] Sistema de notificações real-time
- [ ] Testes end-to-end

### Documentação
- [ ] Tutoriais para iniciantes
- [ ] Documentação da API
- [ ] Guias de deployment
- [ ] Traduções (EN, ES)

### Design
- [ ] Melhorias na UI/UX
- [ ] Design system completo
- [ ] Acessibilidade (a11y)
- [ ] Dark mode refinements

### Infraestrutura
- [ ] CI/CD pipelines
- [ ] Monitoring e observability
- [ ] Performance optimization
- [ ] Security audits

## 📮 Comunicação

- **GitHub Issues**: Para bugs e features
- **Discord**: [discord.gg/bazari](https://discord.gg/bazari) para discussões
- **Twitter**: [@bazari](https://twitter.com/bazari) para updates
- **Email**: dev@bazari.io para questões privadas

## 🏆 Reconhecimento

Todos os contribuidores serão listados em nosso [README](README.md#contributors) e no arquivo [CONTRIBUTORS.md](CONTRIBUTORS.md).

## 📄 Licença

Ao contribuir com o Bazari, você concorda que suas contribuições serão licenciadas sob a licença MIT do projeto.

---

Obrigado por contribuir! 🚀 Juntos estamos construindo o futuro da economia descentralizada.