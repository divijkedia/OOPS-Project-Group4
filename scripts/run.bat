@echo off
setlocal enabledelayedexpansion
title Resolvo Fast Launcher

:: Navigate to project root from scripts/
cd /d "%~dp0.."
set "PROJECT_ROOT=%CD%"

echo =====================================================================
echo   Resolvo Enterprise Portal - Fast Production Launcher
echo =====================================================================
echo Project root: %PROJECT_ROOT%
echo.

:: 1. Verify Java Installation
where java >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Java is not found in PATH. Please install Java 21.
    pause
    exit /b 1
)

:: 2. Verify / Build Backend JAR if missing
set "JAR_PATH=%PROJECT_ROOT%\target\resolvo-backend-1.0.0-SNAPSHOT.jar"
if not exist "%JAR_PATH%" (
    echo [INFO] Pre-compiled JAR not found. Building with Maven wrapper...
    call "%PROJECT_ROOT%\mvnw.cmd" package -DskipTests
    if not exist "%JAR_PATH%" (
        echo [ERROR] Maven build failed.
        pause
        exit /b 1
    )
)

:: 3. Launch Backend with Fast JVM Tier-1 JIT
echo [1/2] Starting Spring Boot Backend on port 8080...
start "Resolvo Backend (:8080)" /D "%PROJECT_ROOT%" cmd /k "java -XX:TieredStopAtLevel=1 -jar target\resolvo-backend-1.0.0-SNAPSHOT.jar --spring.profiles.active=dev"

echo Waiting for Spring Boot to finish initializing on port 8080...
set /a WAIT_COUNT=0

:wait_backend
timeout /t 1 /nobreak >nul
set /a WAIT_COUNT+=1
netstat -ano | findstr ":8080" | findstr "LISTENING" >nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Backend is live and ready on port 8080! (Ready in !WAIT_COUNT!s)
    goto launch_frontend
)
if !WAIT_COUNT! geq 35 (
    echo [NOTICE] Backend initialization took longer than expected; launching frontend...
    goto launch_frontend
)
<nul set /p=". "
goto wait_backend

:launch_frontend
echo.
echo [2/2] Launching Vite Frontend on port 5173 and opening browser...
start "Resolvo Frontend (:5173)" /D "%PROJECT_ROOT%\resolvo-frontend" cmd /k "npm run dev -- --open"

echo.
echo =====================================================================
echo   Resolvo Enterprise Portal is running!
echo   - Backend API: http://localhost:8080  (Swagger: /swagger-ui.html)
echo   - Frontend UI: http://localhost:5173  (Opened in browser)
echo   - Database:    File-backed H2 (data/iitsm_dev.mv.db)
echo =====================================================================
echo.
