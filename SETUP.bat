@echo off
title GANRestore Setup

cd /d "%~dp0"

echo Checking Python...
python --version
if errorlevel 1 (
echo Python is missing. Install Python 3.11 first.
pause
exit /b 1
)

echo Checking Node.js...
node --version
if errorlevel 1 (
echo Node.js is missing. Install Node.js first.
pause
exit /b 1
)

echo Creating Python virtual environment...
if not exist "backend.venv\Scripts\python.exe" (
python -m venv backend.venv
)

echo Installing Python dependencies...
backend.venv\Scripts\python.exe -m pip install --upgrade pip
backend.venv\Scripts\python.exe -m pip install -r backend\requirements-gan.txt

if errorlevel 1 (
echo Python dependency installation failed.
pause
exit /b 1
)

echo Installing frontend dependencies...
cd frontend
call npm install

if errorlevel 1 (
echo Frontend dependency installation failed.
pause
exit /b 1
)

cd /d "%~dp0"
echo.
echo Setup completed. Double-click START.bat to run GANRestore.
pause
