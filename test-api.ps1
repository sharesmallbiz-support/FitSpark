# Test script to verify exercise catalog API
Write-Host "Testing Exercise Catalog API..." -ForegroundColor Green

# Wait a moment for server to be ready
Start-Sleep -Seconds 2

try {
    # Test the status endpoint
    Write-Host "Checking status..." -ForegroundColor Yellow
    $status = Invoke-RestMethod -Uri "http://localhost:5155/api/exercisecatalog/status" -Method GET
    Write-Host "Status: $($status | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
    
    # Test getting all exercises
    Write-Host "Getting all exercises..." -ForegroundColor Yellow
    $exercises = Invoke-RestMethod -Uri "http://localhost:5155/api/exercisecatalog/exercises" -Method GET
    Write-Host "Total exercises found: $($exercises.Count)" -ForegroundColor Cyan
    
    if ($exercises.Count -gt 0) {
        Write-Host "First exercise: $($exercises[0].Name) - Category: $($exercises[0].Category)" -ForegroundColor Green
        
        # Group by category
        $byCategory = $exercises | Group-Object Category
        foreach ($category in $byCategory) {
            Write-Host "Category '$($category.Name)': $($category.Count) exercises" -ForegroundColor Magenta
        }
    }
    
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test completed." -ForegroundColor Green
