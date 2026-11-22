@echo off
title Resolvo Frontend Server (:5173)
cd /d "%~dp0"

echo ========================================================
echo   Starting Resolvo Web Portal (Port 5173)
echo ========================================================

rem 1. Check if portable Node exists in .tools\node
if exist "%~dp0.tools\node\node.exe" (
    set "NODE_DIR=%~dp0.tools\node"
    set "PATH=%~dp0.tools\node;%PATH%"
    set "NPM_CMD=%~dp0.tools\node\npm.cmd"
    echo [OK] Using Bundled Node: %~dp0.tools\node
    goto :NODE_DETECTED
)

rem 2. Check system PATH for node and npm
where node.exe >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "NPM_CMD=npm"
    echo [OK] Using System PATH Node:
    goto :NODE_DETECTED
)

rem Error: No Node found
echo.
echo [ERROR] Node.js 18+ is required but was not found.
echo Please install Node.js 18+ and ensure 'node' and 'npm' are accessible in your PATH.
echo.
pause
exit /b 1

:NODE_DETECTED
node -v

cd /d "%~dp0resolvo-frontend"
echo.
echo [OK] Starting Vite development server...
call %NPM_CMD% run dev

echo.
echo Frontend server stopped.
pause
