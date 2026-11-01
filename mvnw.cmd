@echo off
set "SCRIPT_DIR=%~dp0"
set "JAVA_HOME=%SCRIPT_DIR%.tools\jdk21"
set "PATH=%JAVA_HOME%\bin;%PATH%"
call "%SCRIPT_DIR%.tools\maven\bin\mvn.cmd" %*
exit /b %ERRORLEVEL%
