#!/bin/bash

# ==================================================
# CORREÇÃO RÁPIDA - ERRO BN.js NO BAZARI
# ==================================================

echo "🚀 Aplicando correção rápida para erro BN.js..."

# Opção 1: Correção super rápida (apenas vite config)
quick_fix() {
    echo "📝 Atualizando vite.config.ts..."
    
    # Criar backup
    cp apps/web/vite.config.ts apps/web/vite.config.ts.bak 2>/dev/null
    
    # Aplicar correção no vite.config.ts
    cat > apps/web/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [react(), wasm()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@store': path.resolve(__dirname, './src/store'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@locales': path.resolve(__dirname, './src/locales'),
      'bn.js': 'bn.js/lib/bn.js'
    }
  },
  server: {
    port: 5173,
    host: true,
    fs: { allow: ['..'] }
  },
  optimizeDeps: {
    include: ['bn.js/lib/bn.js', '@polkadot/util', '@polkadot/util-crypto'],
    esbuildOptions: {
      target: 'esnext',
      define: { global: 'globalThis' }
    }
  },
  build: {
    target: 'esnext',
    commonjsOptions: { transformMixedEsModules: true }
  },
  define: {
    'process.env': {},
    global: 'globalThis'
  }
})
EOF
    
    echo "🧹 Limpando cache do Vite..."
    rm -rf apps/web/node_modules/.vite
    
    echo "✅ Correção aplicada!"
    echo "🚀 Execute 'pnpm dev' para iniciar"
}

# Executar correção
quick_fix