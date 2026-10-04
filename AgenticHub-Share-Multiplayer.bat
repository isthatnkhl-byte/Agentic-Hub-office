@echo off
setlocal enabledelayedexpansion
title Agentic Hub Office - Global Multiplayer

echo ========================================================
echo        Starting Agentic Hub in GLOBAL MULTIPLAYER Mode
echo ========================================================
echo.
echo [*] Launching local engine with public Cloudflare Tunnel...
echo [*] Anyone on any laptop in the world will be able to join!
echo.

:: Set working directory
set "APP_DIR=%~dp0"

:: Run launcher with --share flag
cd /d "%APP_DIR%"
node bin/agent-office.js --host 0.0.0.0 --port 4600 --password dev --share
pause
