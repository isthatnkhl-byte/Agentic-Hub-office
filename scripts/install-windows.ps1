# Agentic Hub Office — 1-Click Windows Setup & Desktop App Creator
# Run with: powershell -ExecutionPolicy Bypass -File .\scripts\install-windows.ps1

$ErrorActionPreference = 'Stop'
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "        Setting up Agentic Hub Desktop Software           " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Node.js not detected. Installing via winget..." -ForegroundColor Yellow
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# 2. Paths
$rootDir = (Get-Item $PSScriptRoot).Parent.FullName
$launcherBat = Join-Path $rootDir "AgenticHub-Launcher.bat"

# 3. Build if not already built
$distFolder = Join-Path $rootDir "dist\public"
if (-not (Test-Path $distFolder)) {
    Write-Host "[*] Compiling Agentic Hub client and server..." -ForegroundColor Green
    npm.cmd --prefix $rootDir run build
}

# 4. Create Desktop Shortcut
try {
    $desktopPath = [System.Environment]::GetFolderPath('Desktop')
    $shortcutPath = Join-Path $desktopPath "Agentic Hub.lnk"

    $wscriptShell = New-Object -ComObject WScript.Shell
    $shortcut = $wscriptShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $launcherBat
    $shortcut.WorkingDirectory = $rootDir
    $shortcut.Description = "Agentic Hub - Spatial 3D Multi-Agent Workspace"
    $shortcut.Save()
    Write-Host "[+] Desktop Shortcut created: $shortcutPath" -ForegroundColor Green
} catch {
    Write-Host "[!] Note: Could not create desktop shortcut automatically." -ForegroundColor DarkGray
}

# 5. Create Start Menu Shortcut
try {
    $startMenuPath = Join-Path ([System.Environment]::GetFolderPath('StartMenu')) "Programs"
    $startShortcutPath = Join-Path $startMenuPath "Agentic Hub.lnk"
    $startShortcut = $wscriptShell.CreateShortcut($startShortcutPath)
    $startShortcut.TargetPath = $launcherBat
    $startShortcut.WorkingDirectory = $rootDir
    $startShortcut.Description = "Agentic Hub - Spatial 3D Multi-Agent Workspace"
    $startShortcut.Save()
    Write-Host "[+] Start Menu Shortcut created: $startShortcutPath" -ForegroundColor Green
} catch {
    Write-Host "[!] Note: Could not create start menu shortcut automatically." -ForegroundColor DarkGray
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Installation Complete! You can now launch Agentic Hub  " -ForegroundColor Yellow
Write-Host "   from your Desktop or Start Menu.                       " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
