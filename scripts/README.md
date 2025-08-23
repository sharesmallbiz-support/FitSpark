# FitSpark Scripts Directory

This directory contains powerful automation and analysis scripts for the FitSpark project.

## 📊 Git Activity Report Generator

### Overview

The `Generate-GitActivityReport.ps1` script is a comprehensive Git repository analyzer that generates world-class development activity reports with advanced metrics and insights.

### Features

#### 🔍 **Comprehensive Analytics**

- **Code Churn Analysis**: Lines added, deleted, and modified
- **Author Productivity**: Individual contributor metrics and patterns
- **File Modification Patterns**: Hotspot analysis and change distribution
- **Commit Quality Assessment**: Message length, merge patterns, and frequency
- **Trend Analysis**: Daily activity patterns and productivity trends

#### 📈 **Key Metrics**

- Total commits and lines changed
- Average churn per commit
- Churn rate (deletion to addition ratio)
- File modification distribution
- Author contribution analysis
- Commit frequency and patterns

#### 🎯 **Best Practices Assessment**

- Code review recommendations
- Commit size optimization suggestions
- Development workflow insights
- Quality indicators and health scoring
- Refactoring recommendations

#### 🎨 **Multiple Output Formats**

- **HTML**: Beautiful, interactive web report with charts and visualizations
- **JSON**: Machine-readable data for integration with other tools
- **Console**: Quick overview directly in the terminal

### Usage

#### Basic Usage

```powershell
# Generate HTML report for last 10 days (default)
# Reports are automatically saved to /scripts/report/ folder
.\scripts\Generate-GitActivityReport.ps1

# Generate report for last 14 days
.\scripts\Generate-GitActivityReport.ps1 -Days 14

# Generate JSON report
.\scripts\Generate-GitActivityReport.ps1 -Format JSON

# Console output only
.\scripts\Generate-GitActivityReport.ps1 -Format Console

# Custom output location (overrides default /scripts/report/ folder)
.\scripts\Generate-GitActivityReport.ps1 -OutputPath "C:\Reports"
```

#### Advanced Examples

```powershell
# Comprehensive 30-day analysis with HTML report (saved to /scripts/report/)
.\scripts\Generate-GitActivityReport.ps1 -Days 30 -Format HTML

# Quick console overview for standup meetings
.\scripts\Generate-GitActivityReport.ps1 -Days 7 -Format Console

# Generate JSON for CI/CD integration (saved to /scripts/report/)
.\scripts\Generate-GitActivityReport.ps1 -Days 14 -Format JSON

# Custom output location (overrides default /scripts/report/ folder)
.\scripts\Generate-GitActivityReport.ps1 -Days 30 -Format HTML -OutputPath ".\custom-reports"
```

### Report Directory Structure

All reports are automatically saved to the `/scripts/report/` folder to keep them organized and excluded from version control:

```
scripts/
├── report/               # Generated reports (git-ignored)
│   ├── .gitignore       # Excludes all reports from git
│   ├── git-activity-report-2025-08-23_14-30-15.html
│   ├── git-activity-report-2025-08-23_14-30-15.json
│   └── ...
├── Generate-GitActivityReport.ps1
├── Quick-GitReport.ps1
├── RunGitReport.bat
└── README.md
```

**Benefits:**
- 📁 **Organized**: All reports in one dedicated folder
- 🚫 **Git-ignored**: Reports are excluded from version control automatically
- 🔄 **Consistent**: Same location regardless of how script is executed
- 🗂️ **Clean**: Keeps repository root clean from generated files

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `-Days` | Integer | 10 | Number of days to analyze |
| `-OutputPath` | String | /scripts/report/ | Where to save the report |
| `-Format` | String | HTML | Output format: HTML, JSON, or Console |

### Report Sections

#### 📊 **Key Metrics Dashboard**

- Visual overview of repository activity
- Code churn statistics
- Productivity indicators

#### 🏛️ **Repository Overview**

- Repository metadata
- Branch and tag information
- Historical context

#### 👥 **Author Analysis**

- Individual contributor statistics
- Productivity metrics per author
- Collaboration patterns

#### 📁 **File Modification Analysis**

- Most frequently modified files
- Change distribution patterns
- Hotspot identification

#### 🔍 **Insights & Health Assessment**

- Overall repository health scoring
- Key findings and observations
- Quality indicators

#### 💡 **Recommendations**

- Best practices suggestions
- Process improvement opportunities
- Code quality recommendations

### Sample Insights

The script provides intelligent analysis including:

- **High Churn Detection**: Identifies files with excessive modifications
- **Commit Pattern Analysis**: Evaluates commit frequency and size
- **Collaboration Assessment**: Analyzes multi-author contributions
- **Quality Metrics**: Commit message quality and merge patterns
- **Trend Analysis**: Development velocity and consistency

### Requirements

- **PowerShell 5.1+**
- **Git** (accessible from command line)
- Must be run from within a Git repository

### Best Practices

1. **Regular Analysis**: Run weekly or bi-weekly for ongoing insights
2. **Team Reviews**: Share HTML reports in team meetings
3. **CI/CD Integration**: Use JSON format for automated quality gates
4. **Historical Tracking**: Archive reports to track improvements over time

### Output Examples

#### HTML Report Features

- 🎨 Beautiful, responsive design
- 📊 Interactive metrics dashboard
- 📈 Visual trend analysis
- 🔍 Detailed author breakdowns
- 💡 Actionable recommendations

#### JSON Output Structure

```json
{
  "GeneratedAt": "2025-08-20T...",
  "AnalysisPeriod": 10,
  "Repository": { ... },
  "Metrics": { ... },
  "Authors": { ... },
  "Insights": { ... },
  "Recommendations": [ ... ]
}
```

### Troubleshooting

#### Common Issues

1. **Not in Git Repository**

   ```
   Error: This script must be run from within a Git repository.
   ```

   Solution: Navigate to your Git repository root directory

2. **Git Not Found**

   ```
   Error: Git command not found
   ```

   Solution: Ensure Git is installed and accessible in PATH

3. **Permission Issues**

   ```
   Error: Cannot write to output directory
   ```

   Solution: Check write permissions for the output directory

### Integration Examples

#### CI/CD Pipeline Integration

```yaml
# GitHub Actions example
- name: Generate Git Activity Report
  run: |
    .\scripts\Generate-GitActivityReport.ps1 -Format JSON
    # Reports are automatically saved to scripts/report/ folder
    # Process JSON for quality gates from scripts/report/
```

#### Automated Team Reports

```powershell
# Weekly team report automation
$report = .\scripts\Generate-GitActivityReport.ps1 -Days 7 -Format HTML
# Report is automatically saved to scripts/report/ folder
# Email or post to team chat
```

### Contributing

When adding new scripts to this directory:

1. Follow PowerShell best practices
2. Include comprehensive help documentation
3. Add parameter validation
4. Implement proper error handling
5. Update this README with new script documentation

### Version History

- **v1.0**: Initial release with comprehensive Git activity analysis
  - Code churn metrics
  - Author productivity analysis
  - HTML/JSON/Console output formats
  - Best practices recommendations

---

*This script is part of the FitSpark development toolkit, designed to promote high-quality development practices and team collaboration.*
