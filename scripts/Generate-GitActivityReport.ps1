#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Generates a comprehensive Git repository activity report for the last 10 days

.DESCRIPTION
    This script analyzes Git repository activity and generates a world-class report including:
    - Code churn metrics
    - Commit analysis
    - Author productivity
    - File modification patterns
    - Best practices assessment
    - Quality metrics
    - Trend analysis

.PARAMETER Days
    Number of days to analyze (default: 10)

.PARAMETER OutputPath
    Path where the report will be saved (default: current directory)

.PARAMETER Format
    Output format: HTML, JSON, or Console (default: HTML)

.EXAMPLE
    .\Generate-GitActivityReport.ps1
    .\Generate-GitActivityReport.ps1 -Days 14 -Format JSON
    .\Generate-GitActivityReport.ps1 -OutputPath "C:\Reports" -Format HTML

.NOTES
    Author: FitSpark Development Team
    Version: 1.0
    Requires: Git, PowerShell 5.1+
#>

[CmdletBinding()]
param(
    [Parameter()]
    [int]$Days = 10,
    
    [Parameter()]
    [string]$OutputPath = "",
    
    [Parameter()]
    [ValidateSet("HTML", "JSON", "Console")]
    [string]$Format = "HTML"
)

# Ensure we're in a Git repository
if (-not (Test-Path ".git")) {
    Write-Error "This script must be run from within a Git repository."
    exit 1
}

# Set default output path to scripts/report folder if not specified
if ([string]::IsNullOrEmpty($OutputPath)) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $OutputPath = Join-Path $scriptDir "report"
    
    # Create the report directory if it doesn't exist
    if (-not (Test-Path $OutputPath)) {
        New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
        Write-Host "📁 Created report directory: $OutputPath" -ForegroundColor Green
    }
}

# Initialize variables
$reportData = @{
    GeneratedAt     = Get-Date
    AnalysisPeriod  = $Days
    Repository      = @{}
    Metrics         = @{}
    Authors         = @{}
    Files           = @{}
    Commits         = @()
    Insights        = @{}
    Recommendations = @()
}

Write-Host "🔍 Analyzing Git repository activity for the last $Days days..." -ForegroundColor Cyan

# Get repository information
function Get-RepositoryInfo {
    $repoInfo = @{}
    
    try {
        $repoInfo.Name = (git rev-parse --show-toplevel | Split-Path -Leaf)
        $repoInfo.Branch = git rev-parse --abbrev-ref HEAD
        $repoInfo.RemoteUrl = git config --get remote.origin.url
        $repoInfo.LastCommit = git log -1 --format="%H|%an|%ad|%s" --date=iso
        $repoInfo.TotalCommits = [int](git rev-list --count HEAD)
        $repoInfo.TotalBranches = [int](git branch -a | Measure-Object).Count
        $repoInfo.TotalTags = [int](git tag | Measure-Object).Count
    }
    catch {
        Write-Warning "Could not retrieve some repository information: $_"
    }
    
    return $repoInfo
}

# Get commit data for analysis period
function Get-CommitData {
    param([int]$Days)
    
    $sinceDate = (Get-Date).AddDays(-$Days).ToString("yyyy-MM-dd")
    $commits = @()
    
    try {
        $gitLog = git log --since="$sinceDate" --format="%H|%an|%ae|%ad|%s|%P" --date=iso --numstat
        
        $currentCommit = $null
        $files = @()
        
        foreach ($line in $gitLog) {
            if ($line -match "^[a-f0-9]{40}\|") {
                # Save previous commit if exists
                if ($currentCommit) {
                    $currentCommit.Files = $files
                    $commits += $currentCommit
                }
                
                # Parse new commit
                $parts = $line -split '\|'
                $currentCommit = @{
                    Hash    = $parts[0]
                    Author  = $parts[1]
                    Email   = $parts[2]
                    Date    = [DateTime]::Parse($parts[3])
                    Message = $parts[4]
                    Parents = if ($parts[5]) { $parts[5] -split ' ' } else { @() }
                    IsMerge = ($parts[5] -split ' ').Count -gt 1
                }
                $files = @()
            }
            elseif ($line -match "^\d+\s+\d+\s+.*" -or $line -match "^-\s+-\s+.*") {
                # Parse file changes
                $fileParts = $line -split '\s+', 3
                if ($fileParts.Count -ge 3) {
                    $files += @{
                        Added   = if ($fileParts[0] -eq '-') { 0 } else { [int]$fileParts[0] }
                        Deleted = if ($fileParts[1] -eq '-') { 0 } else { [int]$fileParts[1] }
                        Path    = $fileParts[2]
                    }
                }
            }
        }
        
        # Add last commit
        if ($currentCommit) {
            $currentCommit.Files = $files
            $commits += $currentCommit
        }
    }
    catch {
        Write-Warning "Could not retrieve commit data: $_"
    }
    
    return $commits
}

# Calculate code churn metrics
function Get-CodeChurnMetrics {
    param([array]$Commits)
    
    $metrics = @{
        TotalCommits          = $Commits.Count
        TotalLinesAdded       = 0
        TotalLinesDeleted     = 0
        TotalLinesChanged     = 0
        TotalFilesChanged     = 0
        AverageChurnPerCommit = 0
        ChurnRate             = 0
        FileChurnDistribution = @{}
        DailyChurn            = @{}
    }
    
    $uniqueFiles = @{}
    $dailyStats = @{}
    
    foreach ($commit in $Commits) {
        $commitAdded = 0
        $commitDeleted = 0
        $commitDate = $commit.Date.ToString("yyyy-MM-dd")
        
        if (-not $dailyStats[$commitDate]) {
            $dailyStats[$commitDate] = @{
                Commits      = 0
                LinesAdded   = 0
                LinesDeleted = 0
                FilesChanged = 0
            }
        }
        
        $dailyStats[$commitDate].Commits++
        
        foreach ($file in $commit.Files) {
            $commitAdded += $file.Added
            $commitDeleted += $file.Deleted
            $uniqueFiles[$file.Path] = $true
            
            if (-not $metrics.FileChurnDistribution[$file.Path]) {
                $metrics.FileChurnDistribution[$file.Path] = @{
                    Added   = 0
                    Deleted = 0
                    Commits = 0
                }
            }
            
            $metrics.FileChurnDistribution[$file.Path].Added += $file.Added
            $metrics.FileChurnDistribution[$file.Path].Deleted += $file.Deleted
            $metrics.FileChurnDistribution[$file.Path].Commits++
        }
        
        $dailyStats[$commitDate].LinesAdded += $commitAdded
        $dailyStats[$commitDate].LinesDeleted += $commitDeleted
        $dailyStats[$commitDate].FilesChanged += $commit.Files.Count
        
        $metrics.TotalLinesAdded += $commitAdded
        $metrics.TotalLinesDeleted += $commitDeleted
    }
    
    $metrics.TotalLinesChanged = $metrics.TotalLinesAdded + $metrics.TotalLinesDeleted
    $metrics.TotalFilesChanged = $uniqueFiles.Count
    $metrics.AverageChurnPerCommit = if ($metrics.TotalCommits -gt 0) { 
        [math]::Round($metrics.TotalLinesChanged / $metrics.TotalCommits, 2) 
    }
    else { 0 }
    $metrics.ChurnRate = $metrics.TotalLinesDeleted / [math]::Max($metrics.TotalLinesAdded, 1)
    $metrics.DailyChurn = $dailyStats
    
    return $metrics
}

# Analyze author productivity
function Get-AuthorAnalysis {
    param([array]$Commits)
    
    $authors = @{}
    
    foreach ($commit in $Commits) {
        $author = $commit.Author
        
        if (-not $authors[$author]) {
            $authors[$author] = @{
                Email          = $commit.Email
                Commits        = 0
                LinesAdded     = 0
                LinesDeleted   = 0
                FilesChanged   = @{}
                FirstCommit    = $commit.Date
                LastCommit     = $commit.Date
                MergeCommits   = 0
                CommitMessages = @()
                Productivity   = @{
                    AverageCommitSize = 0
                    FilesDiversity    = 0
                    CommitFrequency   = 0
                }
            }
        }
        
        $authorData = $authors[$author]
        $authorData.Commits++
        
        if ($commit.IsMerge) {
            $authorData.MergeCommits++
        }
        
        if ($commit.Date -lt $authorData.FirstCommit) {
            $authorData.FirstCommit = $commit.Date
        }
        if ($commit.Date -gt $authorData.LastCommit) {
            $authorData.LastCommit = $commit.Date
        }
        
        $authorData.CommitMessages += $commit.Message
        
        foreach ($file in $commit.Files) {
            $authorData.LinesAdded += $file.Added
            $authorData.LinesDeleted += $file.Deleted
            $authorData.FilesChanged[$file.Path] = $true
        }
    }
    
    # Calculate productivity metrics
    foreach ($author in $authors.Keys) {
        $authorData = $authors[$author]
        $totalLines = $authorData.LinesAdded + $authorData.LinesDeleted
        
        $authorData.Productivity.AverageCommitSize = if ($authorData.Commits -gt 0) {
            [math]::Round($totalLines / $authorData.Commits, 2)
        }
        else { 0 }
        
        $authorData.Productivity.FilesDiversity = $authorData.FilesChanged.Count
        
        $daysDiff = ($authorData.LastCommit - $authorData.FirstCommit).Days
        $authorData.Productivity.CommitFrequency = if ($daysDiff -gt 0) {
            [math]::Round($authorData.Commits / $daysDiff, 2)
        }
        else { $authorData.Commits }
    }
    
    return $authors
}

# Generate insights and recommendations
function Get-Insights {
    param(
        [hashtable]$Metrics,
        [hashtable]$Authors,
        [array]$Commits
    )
    
    $insights = @{
        OverallHealth     = "Good"
        KeyFindings       = @()
        TrendAnalysis     = @{}
        QualityIndicators = @{}
    }
    
    $recommendations = @()
    
    # Analyze commit frequency
    if ($Metrics.TotalCommits -eq 0) {
        $insights.OverallHealth = "Poor"
        $insights.KeyFindings += "No commits in the analysis period"
        $recommendations += "Increase development activity and commit frequency"
    }
    elseif ($Metrics.TotalCommits -lt 5) {
        $insights.OverallHealth = "Fair"
        $insights.KeyFindings += "Low commit frequency ($($Metrics.TotalCommits) commits in $Days days)"
        $recommendations += "Consider more frequent, smaller commits for better tracking"
    }
    
    # Analyze code churn
    if ($Metrics.AverageChurnPerCommit -gt 500) {
        $insights.KeyFindings += "High average churn per commit ($($Metrics.AverageChurnPerCommit) lines)"
        $recommendations += "Consider breaking large changes into smaller, focused commits"
    }
    
    if ($Metrics.ChurnRate -gt 0.5) {
        $insights.KeyFindings += "High deletion rate - significant code refactoring detected"
        $recommendations += "High churn rate detected - ensure adequate testing for refactored code"
    }
    
    # Analyze author distribution
    $authorCount = $Authors.Count
    if ($authorCount -eq 1) {
        $insights.KeyFindings += "Single author development - consider code reviews"
        $recommendations += "Implement peer review process even for single-developer projects"
    }
    elseif ($authorCount -gt 5) {
        $insights.KeyFindings += "High number of contributors ($authorCount) - good collaboration"
    }
    
    # Analyze file concentration
    $topFiles = $Metrics.FileChurnDistribution.GetEnumerator() | 
    Sort-Object { $_.Value.Added + $_.Value.Deleted } -Descending | 
    Select-Object -First 5
    
    if ($topFiles) {
        $topFile = $topFiles[0]
        $totalChurn = $Metrics.TotalLinesChanged
        $topFileChurn = $topFile.Value.Added + $topFile.Value.Deleted
        
        if ($totalChurn -gt 0 -and ($topFileChurn / $totalChurn) -gt 0.4) {
            $insights.KeyFindings += "High concentration of changes in '$($topFile.Key)' ($([math]::Round(($topFileChurn / $totalChurn) * 100, 1))%)"
            $recommendations += "Consider refactoring heavily modified files to improve maintainability"
        }
    }
    
    # Quality indicators
    $mergeCommits = ($Commits | Where-Object { $_.IsMerge }).Count
    $insights.QualityIndicators.MergeCommitRatio = if ($Metrics.TotalCommits -gt 0) {
        [math]::Round($mergeCommits / $Metrics.TotalCommits, 2)
    }
    else { 0 }
    
    $insights.QualityIndicators.AverageCommitMessage = if ($Commits.Count -gt 0) {
        [math]::Round(($Commits | ForEach-Object { $_.Message.Length } | Measure-Object -Average).Average, 1)
    }
    else { 0 }
    
    return @{
        Insights        = $insights
        Recommendations = $recommendations
    }
}

# Generate HTML report
function Generate-HtmlReport {
    param(
        [hashtable]$ReportData,
        [string]$OutputPath
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $fileName = "git-activity-report-$timestamp.html"
    $filePath = Join-Path $OutputPath $fileName
    
    $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Git Activity Report - $($ReportData.Repository.Name)</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 15px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .content { padding: 30px; }
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .metric-card { 
            background: #f8f9ff; 
            border: 1px solid #e1e5fe; 
            border-radius: 10px; 
            padding: 20px; 
            text-align: center;
            transition: transform 0.3s ease;
        }
        .metric-card:hover { transform: translateY(-5px); }
        .metric-value { font-size: 2em; font-weight: bold; color: #4facfe; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .section { margin-bottom: 40px; }
        .section h2 { 
            color: #333; 
            border-bottom: 3px solid #4facfe; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
            font-size: 1.8em;
        }
        .author-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
        .author-card { 
            background: #ffffff; 
            border: 1px solid #e0e0e0; 
            border-radius: 8px; 
            padding: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .author-name { font-weight: bold; color: #333; margin-bottom: 5px; }
        .author-stats { font-size: 0.9em; color: #666; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; }
        .recommendations ul { margin-left: 20px; }
        .recommendations li { margin-bottom: 8px; }
        .insights { background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; }
        .file-list { max-height: 300px; overflow-y: auto; }
        .file-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #eee; 
        }
        .health-indicator { 
            display: inline-block; 
            padding: 5px 15px; 
            border-radius: 20px; 
            color: white; 
            font-weight: bold;
            margin-left: 10px;
        }
        .health-good { background: #28a745; }
        .health-fair { background: #ffc107; }
        .health-poor { background: #dc3545; }
        .footer { 
            text-align: center; 
            padding: 20px; 
            background: #f8f9fa; 
            color: #666; 
            border-top: 1px solid #eee;
        }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9ff; font-weight: 600; }
        tr:hover { background: #f5f5f5; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Git Activity Report</h1>
            <p>Repository: <strong>$($ReportData.Repository.Name)</strong> | Period: Last $($ReportData.AnalysisPeriod) days</p>
            <p>Generated on: $($ReportData.GeneratedAt.ToString("yyyy-MM-dd HH:mm:ss"))</p>
        </div>
        
        <div class="content">
            <!-- Key Metrics -->
            <div class="section">
                <h2>📈 Key Metrics</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">$($ReportData.Metrics.TotalCommits)</div>
                        <div class="metric-label">Total Commits</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$($ReportData.Metrics.TotalLinesAdded.ToString("N0"))</div>
                        <div class="metric-label">Lines Added</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$($ReportData.Metrics.TotalLinesDeleted.ToString("N0"))</div>
                        <div class="metric-label">Lines Deleted</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$($ReportData.Metrics.TotalFilesChanged)</div>
                        <div class="metric-label">Files Changed</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$($ReportData.Metrics.AverageChurnPerCommit)</div>
                        <div class="metric-label">Avg Churn/Commit</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$([math]::Round($ReportData.Metrics.ChurnRate, 2))</div>
                        <div class="metric-label">Churn Rate</div>
                    </div>
                </div>
            </div>

            <!-- Repository Overview -->
            <div class="section">
                <h2>🏛️ Repository Overview</h2>
                <table>
                    <tr><th>Property</th><th>Value</th></tr>
                    <tr><td>Repository Name</td><td>$($ReportData.Repository.Name)</td></tr>
                    <tr><td>Current Branch</td><td>$($ReportData.Repository.Branch)</td></tr>
                    <tr><td>Total Commits (All Time)</td><td>$($ReportData.Repository.TotalCommits)</td></tr>
                    <tr><td>Total Branches</td><td>$($ReportData.Repository.TotalBranches)</td></tr>
                    <tr><td>Total Tags</td><td>$($ReportData.Repository.TotalTags)</td></tr>
                </table>
            </div>

            <!-- Author Analysis -->
            <div class="section">
                <h2>👥 Author Analysis</h2>
                <div class="author-list">
"@

    foreach ($author in $ReportData.Authors.GetEnumerator() | Sort-Object { $_.Value.Commits } -Descending) {
        $authorData = $author.Value
        $html += @"
                    <div class="author-card">
                        <div class="author-name">$($author.Key)</div>
                        <div class="author-stats">
                            Commits: <strong>$($authorData.Commits)</strong> | 
                            Lines: +$($authorData.LinesAdded)/-$($authorData.LinesDeleted) | 
                            Files: $($authorData.FilesChanged.Count)<br>
                            Avg Commit Size: $($authorData.Productivity.AverageCommitSize) lines |
                            Commit Frequency: $($authorData.Productivity.CommitFrequency)/day
                        </div>
                    </div>
"@
    }

    $html += @"
                </div>
            </div>

            <!-- Top Modified Files -->
            <div class="section">
                <h2>📁 Most Modified Files</h2>
                <div class="file-list">
"@

    $topFiles = $ReportData.Metrics.FileChurnDistribution.GetEnumerator() | 
    Sort-Object { $_.Value.Added + $_.Value.Deleted } -Descending | 
    Select-Object -First 10

    foreach ($file in $topFiles) {
        $totalChurn = $file.Value.Added + $file.Value.Deleted
        $html += @"
                    <div class="file-item">
                        <span>$($file.Key)</span>
                        <span><strong>$totalChurn</strong> lines (+$($file.Value.Added)/-$($file.Value.Deleted))</span>
                    </div>
"@
    }

    $healthClass = switch ($ReportData.Insights.OverallHealth) {
        "Good" { "health-good" }
        "Fair" { "health-fair" }
        "Poor" { "health-poor" }
        default { "health-fair" }
    }

    $html += @"
                </div>
            </div>

            <!-- Insights -->
            <div class="section">
                <h2>🔍 Key Insights 
                    <span class="health-indicator $healthClass">$($ReportData.Insights.OverallHealth)</span>
                </h2>
                <div class="insights">
"@

    if ($ReportData.Insights.KeyFindings.Count -gt 0) {
        $html += "<ul>"
        foreach ($finding in $ReportData.Insights.KeyFindings) {
            $html += "<li>$finding</li>"
        }
        $html += "</ul>"
    }
    else {
        $html += "<p>No significant issues detected in the analysis period.</p>"
    }

    $html += @"
                </div>
            </div>

            <!-- Recommendations -->
            <div class="section">
                <h2>💡 Recommendations</h2>
                <div class="recommendations">
"@

    if ($ReportData.Recommendations.Count -gt 0) {
        $html += "<ul>"
        foreach ($recommendation in $ReportData.Recommendations) {
            $html += "<li>$recommendation</li>"
        }
        $html += "</ul>"
    }
    else {
        $html += "<p>No specific recommendations at this time. Keep up the good work!</p>"
    }

    $html += @"
                </div>
            </div>

            <!-- Quality Indicators -->
            <div class="section">
                <h2>⚡ Quality Indicators</h2>
                <table>
                    <tr><th>Indicator</th><th>Value</th><th>Assessment</th></tr>
                    <tr>
                        <td>Merge Commit Ratio</td>
                        <td>$($ReportData.Insights.QualityIndicators.MergeCommitRatio)</td>
                        <td>$(if ($ReportData.Insights.QualityIndicators.MergeCommitRatio -lt 0.2) { "Excellent - Clean linear history" } 
                             elseif ($ReportData.Insights.QualityIndicators.MergeCommitRatio -lt 0.4) { "Good - Reasonable branching" }
                             else { "Consider reducing merge commits" })</td>
                    </tr>
                    <tr>
                        <td>Average Commit Message Length</td>
                        <td>$($ReportData.Insights.QualityIndicators.AverageCommitMessage) characters</td>
                        <td>$(if ($ReportData.Insights.QualityIndicators.AverageCommitMessage -gt 20) { "Good - Descriptive messages" } 
                             else { "Consider more descriptive commit messages" })</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated by FitSpark Git Activity Analyzer | PowerShell Script v1.0</p>
            <p>Report includes commits from $((Get-Date).AddDays(-$Days).ToString("yyyy-MM-dd")) to $((Get-Date).ToString("yyyy-MM-dd"))</p>
        </div>
    </div>
</body>
</html>
"@

    $html | Out-File -FilePath $filePath -Encoding UTF8
    return $filePath
}

# Generate JSON report
function Generate-JsonReport {
    param(
        [hashtable]$ReportData,
        [string]$OutputPath
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $fileName = "git-activity-report-$timestamp.json"
    $filePath = Join-Path $OutputPath $fileName
    
    $ReportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $filePath -Encoding UTF8
    return $filePath
}

# Generate console report
function Show-ConsoleReport {
    param([hashtable]$ReportData)
    
    Write-Host "`n" + "="*80 -ForegroundColor Cyan
    Write-Host "  📊 GIT ACTIVITY REPORT - $($ReportData.Repository.Name)" -ForegroundColor Cyan
    Write-Host "="*80 -ForegroundColor Cyan
    
    Write-Host "`n🏛️  REPOSITORY OVERVIEW" -ForegroundColor Yellow
    Write-Host "  Name: $($ReportData.Repository.Name)"
    Write-Host "  Branch: $($ReportData.Repository.Branch)"
    Write-Host "  Analysis Period: Last $($ReportData.AnalysisPeriod) days"
    Write-Host "  Generated: $($ReportData.GeneratedAt)"
    
    Write-Host "`n📈 KEY METRICS" -ForegroundColor Yellow
    Write-Host "  Total Commits: $($ReportData.Metrics.TotalCommits)"
    Write-Host "  Lines Added: $($ReportData.Metrics.TotalLinesAdded)"
    Write-Host "  Lines Deleted: $($ReportData.Metrics.TotalLinesDeleted)"
    Write-Host "  Files Changed: $($ReportData.Metrics.TotalFilesChanged)"
    Write-Host "  Average Churn per Commit: $($ReportData.Metrics.AverageChurnPerCommit) lines"
    Write-Host "  Churn Rate: $([math]::Round($ReportData.Metrics.ChurnRate, 2))"
    
    Write-Host "`n👥 TOP AUTHORS" -ForegroundColor Yellow
    $topAuthors = $ReportData.Authors.GetEnumerator() | Sort-Object { $_.Value.Commits } -Descending | Select-Object -First 5
    foreach ($author in $topAuthors) {
        $authorData = $author.Value
        Write-Host "  $($author.Key): $($authorData.Commits) commits, +$($authorData.LinesAdded)/-$($authorData.LinesDeleted) lines"
    }
    
    Write-Host "`n📁 TOP MODIFIED FILES" -ForegroundColor Yellow
    $topFiles = $ReportData.Metrics.FileChurnDistribution.GetEnumerator() | 
    Sort-Object { $_.Value.Added + $_.Value.Deleted } -Descending | 
    Select-Object -First 5
    foreach ($file in $topFiles) {
        $totalChurn = $file.Value.Added + $file.Value.Deleted
        Write-Host "  $($file.Key): $totalChurn lines changed"
    }
    
    $healthColor = switch ($ReportData.Insights.OverallHealth) {
        "Good" { "Green" }
        "Fair" { "Yellow" }
        "Poor" { "Red" }
        default { "Yellow" }
    }
    
    Write-Host "`n🔍 INSIGHTS" -ForegroundColor Yellow
    Write-Host "  Overall Health: " -NoNewline
    Write-Host $ReportData.Insights.OverallHealth -ForegroundColor $healthColor
    
    if ($ReportData.Insights.KeyFindings.Count -gt 0) {
        Write-Host "  Key Findings:"
        foreach ($finding in $ReportData.Insights.KeyFindings) {
            Write-Host "    • $finding" -ForegroundColor Cyan
        }
    }
    
    if ($ReportData.Recommendations.Count -gt 0) {
        Write-Host "`n💡 RECOMMENDATIONS" -ForegroundColor Yellow
        foreach ($recommendation in $ReportData.Recommendations) {
            Write-Host "  • $recommendation" -ForegroundColor Green
        }
    }
    
    Write-Host "`n" + "="*80 -ForegroundColor Cyan
}

# Main execution
try {
    Write-Host "🚀 Starting Git Activity Analysis..." -ForegroundColor Green
    
    # Gather data
    $reportData.Repository = Get-RepositoryInfo
    $commits = Get-CommitData -Days $Days
    $reportData.Commits = $commits
    $reportData.Metrics = Get-CodeChurnMetrics -Commits $commits
    $reportData.Authors = Get-AuthorAnalysis -Commits $commits
    
    $insightResults = Get-Insights -Metrics $reportData.Metrics -Authors $reportData.Authors -Commits $commits
    $reportData.Insights = $insightResults.Insights
    $reportData.Recommendations = $insightResults.Recommendations
    
    # Generate output
    switch ($Format) {
        "HTML" {
            $outputFile = Generate-HtmlReport -ReportData $reportData -OutputPath $OutputPath
            Write-Host "✅ HTML report generated: $outputFile" -ForegroundColor Green
            
            # Open the report in default browser
            if (Get-Command "Start-Process" -ErrorAction SilentlyContinue) {
                Start-Process $outputFile
            }
        }
        "JSON" {
            $outputFile = Generate-JsonReport -ReportData $reportData -OutputPath $OutputPath
            Write-Host "✅ JSON report generated: $outputFile" -ForegroundColor Green
        }
        "Console" {
            Show-ConsoleReport -ReportData $reportData
        }
    }
    
    Write-Host "`n🎉 Analysis complete!" -ForegroundColor Green
    Write-Host "Summary: $($reportData.Metrics.TotalCommits) commits, $($reportData.Authors.Count) authors, $($reportData.Metrics.TotalFilesChanged) files changed" -ForegroundColor Cyan
}
catch {
    Write-Error "❌ Error during analysis: $_"
    exit 1
}
