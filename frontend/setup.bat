@echo off
REM Quick Start Script for Divine Bakery Website (Windows)

echo.
echo  ╔═══════════════════════════════════════════════════════╗
echo  ║        🎂 Divine Bakery - Website Setup             ║
echo  ║          Professional Local Business Website          ║
echo  ╚═══════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo.
    echo 📥 Please install from: https://nodejs.org
    echo    (Download the LTS version)
    echo.
    pause
    exit /b 1
)

REM Get versions
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
echo    (This may take 2-3 minutes...)
echo.

call npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ Installation failed
    pause
    exit /b 1
)

echo.
echo ✅ Installation complete!
echo.
echo 📝 Available commands:
echo.
echo    npm run dev    - Start development server at http://localhost:3000
echo    npm run build  - Create optimized production build
echo    npm run start  - Start production server
echo    npm run lint   - Run code linter
echo.
echo 🚀 To get started, run:
echo.
echo    npm run dev
echo.
echo 📚 Documentation:
echo    - README.md - Project overview and features
echo    - DEPLOYMENT_GUIDE.md - Complete deployment instructions
echo    - DESIGN_SYSTEM.md - UI/UX design guidelines
echo.
echo 💡 Tips:
echo    1. Update business data in data/business.js
echo    2. Customize colors in tailwind.config.js
echo    3. Deploy for free on Vercel at vercel.com
echo.
echo Press any key to close...
pause >nul
