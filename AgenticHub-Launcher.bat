@echo off
setlocal enabledelayedexpansion
title Agentic Hub Office

echo ========================================================
echo            Starting Agentic Hub Office...
echo   The Spatial 3D Multi-Agent Collaborative Workspace
echo ========================================================
echo.

:: Detect Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required but was not found in your PATH.
    echo Please install Node.js 20+ from https://nodejs.org or via winget:
    echo winget install OpenJS.NodeJS.LTS
    pause
    exit /b 1
)

:: Set working directory
set "APP_DIR=%~dp0"

:: Set default port and password
set "PORT=4600"
set "PASSWORD=dev"
if not "%~1"=="" set "PORT=%~1"
if not "%~2"=="" set "PASSWORD=%~2"

echo [1/3] Checking build bundles...
if not exist "%APP_DIR%dist" (
    echo Building Agentic Hub for first launch...
    pushd "%APP_DIR%"
    call npm run build
    popd
)

echo [2/3] Launching background Agentic Hub engine on port %PORT%...
start "Agentic Hub Daemon" /min cmd /c "cd /d "%APP_DIR%" && node bin/agent-office.js --host 127.0.0.1 --port %PORT% --password %PASSWORD% --no-open"

echo [3/3] Opening native desktop application window...
timeout /t 2 /nobreak >nul

:: Launch using Windows default browser in standalone app mode (Edge or Chrome)
set "APP_URL=http://localhost:%PORT%/login.html"
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start msedge --app="%APP_URL%" --window-size=1280,800
) else (
    where chrome >nul 2>nul
    if %errorlevel% equ 0 (
        start chrome --app="%APP_URL%" --window-size=1280,800
    ) else (
        start "" "%APP_URL%"
    )
)

echo.
echo ========================================================
echo   Agentic Hub is now running!
echo   Local Address : http://localhost:%PORT%
echo   Default Pass  : %PASSWORD%
echo ========================================================
echo (Keep this window open or minimize it while using Agentic Hub)
echo.
