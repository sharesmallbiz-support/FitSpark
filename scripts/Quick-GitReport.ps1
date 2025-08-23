#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Quick launcher for Git Activity Report Generator

.DESCRIPTION
    Provides easy access to the Git Activity Report Generator with common presets

.PARAMETER Preset
    Quick preset options: Daily, Weekly, BiWeekly, Monthly, or Custom

.PARAMETER Format
    Output format: HTML, JSON, or Console

.EXAMPLE
    .\Quick-GitReport.ps1
    .\Quick-GitReport.ps1 -Preset Weekly
    .\Quick-GitReport.ps1 -Preset Monthly -Format JSON

.NOTES
    This is a convenience wrapper around Generate-GitActivityReport.ps1
#>

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet("Daily", "Weekly", "BiWeekly", "Monthly", "Custom")]
    [string]$Preset = "Weekly",
    
    [Parameter()]
    [ValidateSet("HTML", "JSON", "Console")]
    [string]$Format = "HTML"
)

# Define presets
$presets = @{
    "Daily"    = 1
    "Weekly"   = 7
    "BiWeekly" = 14
    "Monthly"  = 30
    "Custom"   = 10
}

$days = $presets[$Preset]

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mainScript = Join-Path $scriptDir "Generate-GitActivityReport.ps1"

# Check if main script exists
if (-not (Test-Path $mainScript)) {
    Write-Error "Cannot find Generate-GitActivityReport.ps1 in the scripts directory"
    exit 1
}

Write-Host "Quick Git Report Launcher" -ForegroundColor Cyan
Write-Host "Preset: $Preset ($days days) | Format: $Format" -ForegroundColor Yellow

if ($Preset -eq "Custom") {
    $customDays = Read-Host "Enter number of days to analyze"
    if ($customDays -and $customDays -match '^\d+$') {
        $days = [int]$customDays
    }
}

# Run the main script
try {
    # Set output path to reports folder
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $reportsPath = Join-Path $scriptDir "report"
    
    # Create the report directory if it doesn't exist
    if (-not (Test-Path $reportsPath)) {
        New-Item -ItemType Directory -Path $reportsPath -Force | Out-Null
        Write-Host "Created report directory: $reportsPath" -ForegroundColor Green
    }
    
    & $mainScript -Days $days -Format $Format -OutputPath $reportsPath
}
catch {
    Write-Error "Failed to run Git activity report: $_"
    exit 1
}
