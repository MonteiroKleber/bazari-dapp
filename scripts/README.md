# 📜 Scripts do Projeto Bazari

## 🔍 Scripts de Verificação de Estrutura

### **check-structure** - Verificar estrutura completa do projeto

Verifica se todos os arquivos e diretórios necessários estão presentes.

#### 🚀 Como Usar:

```bash
# Opção 1: Usando pnpm (recomendado)
pnpm check
# ou
pnpm check:structure

# Opção 2: Usando Node.js diretamente
node scripts/check-structure.js

# Opção 3: Usando Bash (Linux/Mac)
chmod +x scripts/check-structure.sh
./scripts/check-structure.sh

# Opção 4: Usando Python
python scripts/check-structure.py
```

#### 📊 O que verifica:
- ✅ 77 arquivos obrigatórios das Etapas 1 e 2
- ⚠️ 9 diretórios opcionais para próximas etapas
- 📁 Estrutura completa de pastas
- 📄 Todos os arquivos de configuração

#### 🎨 Output:
- **Verde (✅)**: Arquivo/diretório existe
- **Vermelho (❌)**: Arquivo/diretório faltando (obrigatório)
- **Amarelo (⚠️)**: Arquivo/diretório opcional (próxima etapa)

---

### **fix-missing** - Criar arquivos faltantes

Cria automaticamente todos os arquivos e diretórios que estão faltando.

#### 🚀 Como Usar:

```bash
# Tornar executável (apenas primeira vez)
chmod +x scripts/fix-missing.sh

# Executar
./scripts/fix-missing.sh
```

#### ⚠️ Importante:
- Cria arquivos com conteúdo básico/vazio
- Você deve substituir pelo conteúdo real depois
- Útil para criar a estrutura rapidamente

---

## 🛠️ Scripts de Setup e Manutenção

### **setup** - Configuração inicial
```bash
# Linux/Mac
./scripts/setup.sh

# Windows
./scripts/setup.ps1
```

### **clean** - Limpar projeto
```bash
./scripts/clean.sh
# ou
pnpm clean
```

### **fix-wasm** - Corrigir problemas WASM
```bash
./scripts/fix-wasm.sh
```

---

## 📋 Scripts Disponíveis no package.json

```json
{
  "scripts": {
    "dev": "Iniciar desenvolvimento",
    "build": "Build de produção",
    "check": "Verificar estrutura",
    "check:structure": "Verificar estrutura (alias)",
    "check:bash": "Verificar com bash",
    "check:python": "Verificar com python",
    "clean": "Limpar projeto",
    "setup": "Setup inicial"
  }
}
```

---

## 🔄 Fluxo Recomendado

1. **Verificar estrutura**
   ```bash
   pnpm check
   ```

2. **Se houver arquivos faltando**
   ```bash
   ./scripts/fix-missing.sh
   ```

3. **Verificar novamente**
   ```bash
   pnpm check
   ```

4. **Instalar dependências**
   ```bash
   pnpm install
   ```

5. **Iniciar desenvolvimento**
   ```bash
   pnpm dev
   ```

---

## 🎯 Status Esperado

Quando tudo estiver correto, você verá:

```
╔══════════════════════════════════════════════════════╗
║         ✅ ESTRUTURA COMPLETA E CORRETA! ✅         ║
║      Todos os arquivos obrigatórios presentes!      ║
╚══════════════════════════════════════════════════════╝

🎉 Projeto pronto para desenvolvimento!
🚀 Execute 'pnpm dev' para iniciar
```

---

## 📝 Notas

- Os scripts verificam a estrutura baseada nas **Etapas 1 e 2 completas**
- Arquivos de próximas etapas são marcados como **opcionais**
- Use `check-structure.js` para melhor compatibilidade entre sistemas
- Use `fix-missing.sh` com cuidado - ele cria arquivos vazios/básicos