#!/bin/bash
# setup.sh — первый запуск на новой машине

set -e

echo "🔍 Проверяем окружение..."

# Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js не найден. Установи с https://nodejs.org/ (v18+)"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# pnpm
if ! command -v pnpm &> /dev/null; then
  echo "📦 Устанавливаем pnpm..."
  npm install -g pnpm
fi
echo "✅ pnpm $(pnpm -v)"

# Зависимости
echo "📦 Устанавливаем зависимости..."
pnpm install

echo ""
echo "✅ Готово! Запусти:"
echo "   pnpm dev"
echo ""
echo "   Откроется http://localhost:5173"
