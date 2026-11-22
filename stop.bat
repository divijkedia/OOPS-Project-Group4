@echo off
title Stop Resolvo ITSM
echo ========================================================
echo   Stopping Resolvo Backend and Frontend Servers...
echo ========================================================

rem Find and terminate processes listening on port 8080 (backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo Terminating backend process (PID %%a)...
    taskkill /F /PID %%a 2>nul
)

rem Find and terminate processes listening on port 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Terminating frontend process (PID %%a)...
    taskkill /F /PID %%a 2>nul
)

echo.
echo [OK] All Resolvo services have been stopped.
timeout /t 3 >nul
