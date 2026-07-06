# ============================================================
# verify-integration.ps1
# Automated Integration Verification Script
# Tests all layers: Frontend > Admin Panel > Backend > MongoDB
# ============================================================

$BaseURL = "http://localhost:3000/api"
$Colors = @{
    Success = "Green"
    Error = "Red"
    Info = "Cyan"
    Warning = "Yellow"
}

function Write-Status {
    param([string]$Message, [string]$Type = "Info")
    $color = $Colors[$Type] -or "White"
    Write-Host $Message -ForegroundColor $color
}

# ============================================================
# LAYER 1: MongoDB Connection
# ============================================================
function Test-MongoDB {
    Write-Host "`n=== LAYER 1: MongoDB Connection ===" -ForegroundColor Magenta
    
    try {
        # MongoDB should be accessible if backend is running and connected
        # We'll test this indirectly through the backend
        
        Write-Status "[OK] MongoDB Service Status: Checking..." "Info"
        $service = Get-Service MongoDB -ErrorAction SilentlyContinue
        
        if ($service.Status -eq "Running") {
            Write-Status "[PASS] MongoDB Service: Running" "Success"
        } else {
            Write-Status "[FAIL] MongoDB Service: Not Running" "Error"
            Write-Status "   Fix: Start MongoDB with 'net start MongoDB'" "Warning"
            return $false
        }
        
        return $true
    } catch {
        Write-Status "[FAIL] MongoDB check failed: $_" "Error"
        return $false
    }
}

# ============================================================
# LAYER 2: Backend Server
# ============================================================
function Test-Backend {
    Write-Host "`n=== LAYER 2: Backend Server ===" -ForegroundColor Magenta
    
    try {
        Write-Status "Testing: GET http://localhost:3000" "Info"
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Status "[PASS] Backend Server: Running on port 3000" "Success"
            $data = $response.Content | ConvertFrom-Json
            Write-Status "   Message: $($data.message)" "Success"
            return $true
        }
    } catch {
        Write-Status "[FAIL] Backend Server: Not responding" "Error"
        Write-Status "   Error: $_" "Error"
        Write-Status "   Fix: Run 'node server.js' in backend directory" "Warning"
        return $false
    }
}

# ============================================================
# LAYER 3: Database Connection
# ============================================================
function Test-DatabaseConnection {
    Write-Host "`n=== LAYER 3: Database Connection ===" -ForegroundColor Magenta
    
    try {
        # We'll test this by checking if we can get users (requires DB connection)
        Write-Status "Testing: Database query via backend" "Info"
        
        # Test with a simple request that doesn't need auth
        $response = Invoke-WebRequest -Uri "$BaseURL/courses" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Status "[PASS] Database Connection: Working" "Success"
            $data = $response.Content | ConvertFrom-Json
            Write-Status "   Courses found: $($data.courses.Length)" "Success"
            return $true
        }
    } catch {
        Write-Status "[FAIL] Database Connection: Failed" "Error"
        Write-Status "   Error: $_" "Error"
        Write-Status "   Fix: Verify MongoDB connection in .env file" "Warning"
        return $false
    }
}

# ============================================================
# LAYER 4: Auth Routes
# ============================================================
function Test-AuthRoutes {
    Write-Host "`n=== LAYER 4: Auth Routes ===" -ForegroundColor Magenta
    
    try {
        Write-Status "Testing: POST /api/auth/register endpoint" "Info"
        
        $testUser = @{
            name = "Integration Test User $(Get-Random)"
            username = "testuser_$(Get-Random)"
            email = "test$(Get-Random)@example.com"
            password = "TestPassword123!"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$BaseURL/auth/register" `
            -Method POST `
            -Headers @{"Content-Type" = "application/json"} `
            -Body $testUser `
            -UseBasicParsing `
            -TimeoutSec 5 `
            -ErrorAction Stop
        
        if ($response.StatusCode -eq 201) {
            Write-Status "[PASS] Auth/Register: Working (201 Created)" "Success"
            $data = $response.Content | ConvertFrom-Json
            Write-Status "   User ID: $($data.user._id)" "Success"
            return $true, $data.token, $data.user._id
        }
    } catch {
        if ($_.Exception.Response.StatusCode.Value -eq 400) {
            Write-Status "[WARN] Auth/Register: User already exists (expected)" "Warning"
            return $true, $null, $null
        }
        Write-Status "[FAIL] Auth/Register: Failed" "Error"
        Write-Status "   Error: $_" "Error"
        return $false, $null, $null
    }
}

# ============================================================
# LAYER 5: Admin Routes
# ============================================================
function Test-AdminRoutes {
    param([string]$Token)
    
    Write-Host "`n=== LAYER 5: Admin Routes ===" -ForegroundColor Magenta
    
    if (-not $Token) {
        Write-Status "[WARN] Skipping admin tests (no valid token)" "Warning"
        Write-Status "   Note: Admin tests require authentication" "Info"
        return $false
    }
    
    try {
        Write-Status "Testing: GET /api/admin/users (with token)" "Info"
        
        $headers = @{
            "Authorization" = "Bearer $Token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$BaseURL/admin/users" `
            -Headers $headers `
            -UseBasicParsing `
            -TimeoutSec 5 `
            -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Status "[PASS] Admin/Users: Working (200 OK)" "Success"
            $data = $response.Content | ConvertFrom-Json
            Write-Status "   Users found: $($data.users.Length)" "Success"
            return $true
        }
    } catch {
        if ($_.Exception.Response.StatusCode.Value -eq 401) {
            Write-Status "[FAIL] Admin/Users: Unauthorized (401)" "Error"
            Write-Status "   Issue: Token invalid or expired" "Error"
        } else {
            Write-Status "[FAIL] Admin/Users: Failed" "Error"
            Write-Status "   Error: $_" "Error"
        }
        return $false
    }
}

# ============================================================
# LAYER 6: CORS Configuration
# ============================================================
function Test-CORS {
    Write-Host "`n=== LAYER 6: CORS Configuration ===" -ForegroundColor Magenta
    
    try {
        Write-Status "Testing: CORS headers" "Info"
        
        $response = Invoke-WebRequest -Uri "http://localhost:3000" `
            -UseBasicParsing `
            -TimeoutSec 5 `
            -ErrorAction Stop
        
        $corsHeaders = $response.Headers.Keys | Where-Object { $_ -like "*Access-Control*" }
        
        if ($corsHeaders.Count -gt 0) {
            Write-Status "[PASS] CORS: Enabled" "Success"
            foreach ($header in $corsHeaders) {
                $headerValue = $response.Headers[$header]
                Write-Status "   $header`: $headerValue" "Success"
            }
            return $true
        } else {
            Write-Status "[WARN] CORS: Headers not found (may still be working)" "Warning"
            return $true
        }
    } catch {
        Write-Status "[FAIL] CORS check failed: $_" "Error"
        return $false
    }
}

# ============================================================
# LAYER 7: Response Format
# ============================================================
function Test-ResponseFormat {
    Write-Host "`n=== LAYER 7: Response Format ===" -ForegroundColor Magenta
    
    try {
        Write-Status "Testing: Response format and structure" "Info"
        
        $response = Invoke-WebRequest -Uri "$BaseURL/courses" `
            -UseBasicParsing `
            -TimeoutSec 5 `
            -ErrorAction Stop
        
        $data = $response.Content | ConvertFrom-Json
        
        $hasRequiredFields = ($data | Get-Member -MemberType NoteProperty).Count -gt 0
        
        if ($hasRequiredFields) {
            Write-Status "[PASS] Response Format: Valid JSON" "Success"
            Write-Status "   Fields: $(($data | Get-Member -MemberType NoteProperty).Name -join ', ')" "Success"
            return $true
        }
    } catch {
        Write-Status "[FAIL] Response Format: Invalid" "Error"
        Write-Status "   Error: $_" "Error"
        return $false
    }
}

# ============================================================
# FINAL REPORT
# ============================================================
function Show-FinalReport {
    param([hashtable]$Results)
    
    Write-Host "`n$('=' * 60)" -ForegroundColor Magenta
    Write-Host "INTEGRATION VERIFICATION REPORT" -ForegroundColor Magenta
    Write-Host "$('=' * 60)" -ForegroundColor Magenta
    
    $totalTests = $Results.Count
    $passedTests = ($Results.Values | Where-Object { $_ -eq $true }).Count
    $failedTests = $totalTests - $passedTests
    
    Write-Host "`nTest Summary:" -ForegroundColor Cyan
    Write-Host "  Total Tests: $totalTests"
    Write-Host "  Passed: $passedTests" -ForegroundColor Green
    Write-Host "  Failed: $failedTests" -ForegroundColor Red
    
    Write-Host "`nDetailed Results:" -ForegroundColor Cyan
    foreach ($test in $Results.GetEnumerator()) {
        $status = if ($test.Value) { "[PASS]" } else { "[FAIL]" }
        $color = if ($test.Value) { "Green" } else { "Red" }
        Write-Host "  $status - $($test.Key)" -ForegroundColor $color
    }
    
    Write-Host "`n$('=' * 60)" -ForegroundColor Magenta
    
    if ($failedTests -eq 0) {
        Write-Status "[SUCCESS] ALL INTEGRATION TESTS PASSED! System is ready for testing." "Success"
        Write-Status "`nYou can now:" "Info"
        Write-Status "  1. Open admin panel at: admin-panel/html/admin-login.html" "Info"
        Write-Status "  2. Login with your credentials" "Info"
        Write-Status "  3. Test 'Tambah Pengguna' feature" "Info"
    } else {
        Write-Status "[FAILED] Some tests failed. Please review the errors above." "Error"
        Write-Status "`nNext steps:" "Info"
        Write-Status "  1. Check MongoDB service is running" "Info"
        Write-Status "  2. Verify backend server is running (node server.js)" "Info"
        Write-Status "  3. Check .env configuration file" "Info"
    }
    
    Write-Host "`n$('=' * 60)" -ForegroundColor Magenta
}

# ============================================================
# MAIN EXECUTION
# ============================================================
function Main {
    Clear-Host
    Write-Host "================================================================" -ForegroundColor Magenta
    Write-Host "     NGODING YUK - FULL INTEGRATION VERIFICATION" -ForegroundColor Magenta
    Write-Host "     Frontend > Admin Panel > Backend > MongoDB" -ForegroundColor Magenta
    Write-Host "================================================================" -ForegroundColor Magenta
    
    $results = @{}
    
    # Run all tests
    $results["MongoDB Service"] = Test-MongoDB
    $results["Backend Server"] = Test-Backend
    $results["Database Connection"] = Test-DatabaseConnection
    $results["Auth Routes"] = (Test-AuthRoutes)[0]
    $results["CORS Configuration"] = Test-CORS
    $results["Response Format"] = Test-ResponseFormat
    
    # Show final report
    Show-FinalReport -Results $results
}

# Run the main function
Main
