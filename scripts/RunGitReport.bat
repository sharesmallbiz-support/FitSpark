@echo off
setlocal

echo.
echo =====================================================
echo    FitSpark Git Activity Report Generator
echo =====================================================
echo.

cd /d "%~dp0.."

echo Choose report type:
echo 1. Quick Console Report (7 days)
echo 2. Weekly HTML Report (7 days)
echo 3. Bi-Weekly HTML Report (14 days)
echo 4. Monthly HTML Report (30 days)
echo 5. Custom Report
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    powershell -ExecutionPolicy Bypass -File "scripts\Generate-GitActivityReport.ps1" -Days 7 -Format Console -OutputPath "scripts\report"
) else if "%choice%"=="2" (
    powershell -ExecutionPolicy Bypass -File "scripts\Generate-GitActivityReport.ps1" -Days 7 -Format HTML -OutputPath "scripts\report"
) else if "%choice%"=="3" (
    powershell -ExecutionPolicy Bypass -File "scripts\Generate-GitActivityReport.ps1" -Days 14 -Format HTML -OutputPath "scripts\report"
) else if "%choice%"=="4" (
    powershell -ExecutionPolicy Bypass -File "scripts\Generate-GitActivityReport.ps1" -Days 30 -Format HTML -OutputPath "scripts\report"
) else if "%choice%"=="5" (
    set /p days="Enter number of days: "
    echo Choose format:
    echo 1. HTML
    echo 2. JSON
    echo 3. Console
    set /p format_choice="Enter format choice (1-3): "
    
    if "!format_choice!"=="1" set format=HTML
    if "!format_choice!"=="2" set format=JSON
    if "!format_choice!"=="3" set format=Console
    
    powershell -ExecutionPolicy Bypass -File "scripts\Generate-GitActivityReport.ps1" -Days !days! -Format !format! -OutputPath "scripts\report"
) else (
    echo Invalid choice. Running default weekly report...
    powershell -ExecutionPolicy Bypass -File "scripts\Generate-GitActivityReport.ps1" -Days 7 -Format HTML -OutputPath "scripts\report"
)

echo.
echo Report generation complete!
pause
