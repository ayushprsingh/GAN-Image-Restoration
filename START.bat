@echo off
title GANRestore Launcher
cd /d "%~dp0"

if not exist "backend.venv\Scripts\python.exe" (
echo Please run SETUP.bat first.
pause
exit /b 1
)

if not exist "frontend\node_modules" (
echo Please run SETUP.bat first.
pause
exit /b 1
)

start "GANRestore Backend" cmd /k "cd /d ""%~dp0backend"" && .venv\Scripts\python.exe app.py"
timeout /t 3 /nobreak >nul
start "GANRestore Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"
timeout /t 5 /nobreak >nul
start http://localhost:5173/
exit
