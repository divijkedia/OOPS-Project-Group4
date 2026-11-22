@echo off
setlocal
title Resolvo Server Stop Utility

echo =====================================================================
echo   Stopping Resolvo Backend (8080) and Frontend (5173)...
echo =====================================================================

:: Stop process on port 8080 (Spring Boot)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo Stopping Backend PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

:: Stop process on port 5173 (Vite)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Stopping Frontend PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All Resolvo servers stopped successfully.
pause
