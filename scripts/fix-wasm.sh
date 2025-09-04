#!/bin/bash

# Fix WASM issues for Bazari project

echo "🔧 Fixing WASM configuration for Bazari..."

# Navigate to web app
cd apps/web

# Install required Vite plugins
echo "📦 Installing Vite WASM plugins..."
pnpm add -D vite-plugin-wasm vite-plugin-top-level-await

# Clean cache and reinstall
echo "🧹 Cleaning cache..."
rm -rf node_modules .vite
cd ../..
pnpm store prune

echo "📦 Reinstalling dependencies..."
pnpm install

echo "✅ WASM configuration fixed!"
echo "🚀 You can now run: pnpm dev"