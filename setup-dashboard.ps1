# Script de instalação de dependências para o Dashboard DJELOG
# Execute este arquivo no PowerShell

Write-Host "==================================="  -ForegroundColor Cyan
Write-Host "  DJELOG Dashboard - Setup"  -ForegroundColor Cyan
Write-Host "  Industrial Neon-Noir Theme"  -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Instalando dependências base do Angular..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "2. Instalando Angular Material..." -ForegroundColor Yellow
Write-Host "   Escolha as seguintes opções quando solicitado:" -ForegroundColor Gray
Write-Host "   - Theme: Custom (ou Deep Purple/Amber)" -ForegroundColor Gray
Write-Host "   - Typography: Yes" -ForegroundColor Gray
Write-Host "   - Animations: Yes" -ForegroundColor Gray
Write-Host ""
ng add @angular/material --skip-confirmation

Write-Host ""
Write-Host "3. Instalando Chart.js e ng2-charts..." -ForegroundColor Yellow
npm install ng2-charts chart.js --save

Write-Host ""
Write-Host "4. Registrando Chart.js no Angular..." -ForegroundColor Yellow
# Chart.js precisa ser registrado globalmente no Angular 17+

Write-Host ""
Write-Host "==================================="  -ForegroundColor Green
Write-Host "  ✓ Instalação concluída!"  -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o servidor de desenvolvimento:" -ForegroundColor Yellow
Write-Host "  ng serve" -ForegroundColor Cyan
Write-Host ""
Write-Host "Acesse: http://localhost:4200" -ForegroundColor Yellow
Write-Host ""
Write-Host "Leia DASHBOARD-README.md para documentação completa." -ForegroundColor Gray
Write-Host ""
