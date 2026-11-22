@echo off
title Resolvo Backend Server (:8080)
cd /d "%~dp0"

echo ========================================================
echo   Starting Resolvo ITIL Backend (Port 8080)
echo ========================================================

rem 1. Check if portable JDK exists in .tools\jdk21
if exist "%~dp0.tools\jdk21\bin\java.exe" (
    set "JAVA_HOME=%~dp0.tools\jdk21"
    set "PATH=%~dp0.tools\jdk21\bin;%PATH%"
    echo [OK] Using Bundled Java: %~dp0.tools\jdk21
    goto :JAVA_DETECTED
)

rem 2. Check system JAVA_HOME
if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\java.exe" (
        set "PATH=%JAVA_HOME%\bin;%PATH%"
        echo [OK] Using System JAVA_HOME: %JAVA_HOME%
        goto :JAVA_DETECTED
    )
)

rem 3. Check system PATH for java
where java.exe >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Using System PATH Java:
    goto :JAVA_DETECTED
)

rem Error: No Java found
echo.
echo [ERROR] Java 21 is required but was not found.
echo Please ensure Java 21 (LTS) is installed and accessible in your PATH,
echo or set the JAVA_HOME environment variable.
echo.
pause
exit /b 1

:JAVA_DETECTED
java -version

if exist "%~dp0target\resolvo-backend-1.0.0-SNAPSHOT.jar" (
    echo.
    echo [OK] Launching packaged executable JAR...
    java -jar "%~dp0target\resolvo-backend-1.0.0-SNAPSHOT.jar"
) else (
    echo.
    echo [INFO] JAR not found, launching via Maven Wrapper...
    call "%~dp0mvnw.cmd" spring-boot:run
)

echo.
echo Backend server stopped.
pause
