$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList "-NoExit -File `"$ScriptDir\start-backend.ps1`""
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit -File `"$ScriptDir\start-frontend.ps1`""

Write-Host "Both Backend and Frontend have been launched in separate PowerShell windows." -ForegroundColor Green
Write-Host "- Backend:  http://localhost:8080/swagger-ui.html"
Write-Host "- Frontend: http://localhost:5173"
