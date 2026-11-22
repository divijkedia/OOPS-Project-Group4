$ErrorActionPreference = "Stop"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Resolvo ITIL Backend (Port 8080)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$BundledJava = Join-Path $ScriptDir ".tools\jdk21"
if (Test-Path (Join-Path $BundledJava "bin\java.exe")) {
    $env:JAVA_HOME = $BundledJava
    $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
    $JavaExe = "$env:JAVA_HOME\bin\java.exe"
    Write-Host "[OK] Using Bundled Java: $BundledJava" -ForegroundColor Green
} elseif ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
    $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
    $JavaExe = "$env:JAVA_HOME\bin\java.exe"
    Write-Host "[OK] Using System JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
} elseif (Get-Command java -ErrorAction SilentlyContinue) {
    $JavaExe = "java"
    Write-Host "[OK] Using System PATH Java" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Java 21 is required but was not found." -ForegroundColor Red
    Write-Host "Please install Java 21 (LTS) or configure JAVA_HOME." -ForegroundColor Yellow
    exit 1
}

$JarPath = Join-Path $ScriptDir "target\resolvo-backend-1.0.0-SNAPSHOT.jar"

if (Test-Path $JarPath) {
    Write-Host "[OK] Launching packaged executable JAR..." -ForegroundColor Green
    & $JavaExe -jar $JarPath
} else {
    Write-Host "[INFO] JAR not found, launching via Maven Wrapper..." -ForegroundColor Yellow
    & "$ScriptDir\mvnw.cmd" spring-boot:run
}
