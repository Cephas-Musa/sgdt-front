# Test direct de l'API dossiers avec OTP bypass (code 000000)
$phoneNumber = "+243813478556"

# Step 1: Login (obtenir OTP)
Write-Host "Step 1: Login..."
try {
    $loginBody = "{`"phone_number`":`"$phoneNumber`",`"password`":`"password`"}"
    $loginResp = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/login" `
        -Method POST -ContentType "application/json" -Body $loginBody
    Write-Host "Login status: $($loginResp.status)"
} catch {
    Write-Host "Login error: $_"
    exit
}

# Step 2: Verify OTP with bypass code
Write-Host "Step 2: Verify OTP (bypass 000000)..."
try {
    $otpBody = "{`"phone_number`":`"$phoneNumber`",`"code`":`"000000`"}"
    $otpResp = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/verify-otp" `
        -Method POST -ContentType "application/json" -Body $otpBody
    $token = $otpResp.access_token
    Write-Host "Token obtained: $($token.Substring(0, [Math]::Min(20, $token.Length)))..."
} catch {
    Write-Host "OTP error: $_"
    exit
}

# Step 3: Test /api/dossiers
Write-Host "Step 3: GET /api/dossiers..."
try {
    $headers = @{ Authorization = "Bearer $token"; Accept = "application/json" }
    $dossiers = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/dossiers" `
        -Method GET -Headers $headers
    Write-Host "SUCCESS! Dossiers count: $($dossiers.Count)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERROR HTTP $statusCode : $_"
}

# Step 4: Test /api/users
Write-Host "Step 4: GET /api/users..."
try {
    $users = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/users" `
        -Method GET -Headers $headers
    Write-Host "SUCCESS! Users count: $($users.Count)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERROR HTTP $statusCode : $_"
}
