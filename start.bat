@echo off
setlocal
title Ledgerly App

echo ==========================================
echo       Setting up Ledgerly...
echo ==========================================

:: Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Check if concurrently is installed (marker of a successful install)
if not exist "node_modules\.bin\concurrently.cmd" (
    echo Installing dependencies...
    echo (Using --legacy-peer-deps to resolve React 19 conflicts)
    
    call npm install --legacy-peer-deps
    
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install dependencies.
        echo Please check the error message above.
        pause
        exit /b
    )
) else (
    echo Dependencies appear to be installed.
)

echo.
echo ==========================================
echo       Starting Ledgerly App
echo ==========================================
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server.
echo.

:: Run the dev script
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Application exited with code %errorlevel%.
)

pause