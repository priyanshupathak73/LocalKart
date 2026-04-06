#!/bin/bash
# Quick Start Script for Divine Bakery Website

echo "🎂 Divine Bakery - Website Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "📥 Please install from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Available commands:"
echo "   npm run dev    - Start development server (http://localhost:3000)"
echo "   npm run build  - Create production build"
echo "   npm run start  - Start production server"
echo "   npm run lint   - Run ESLint"
echo ""
echo "🚀 To get started, run:"
echo "   npm run dev"
echo ""
