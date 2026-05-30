$phoneNumber = "+243813478556"

# Login
$loginBody = "{`"phone_number`":`"$phoneNumber`",`"password`":`"password`"}"
$loginResp = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/login" -Method POST -ContentType "application/json" -Body $loginBody
$otpBody = "{`"phone_number`":`"$phoneNumber`",`"code`":`"000000`"}"
$otpResp = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/verify-otp" -Method POST -ContentType "application/json" -Body $otpBody
$token = $otpResp.access_token
$headers = @{ Authorization = "Bearer $token"; Accept = "application/json" }

# Test all endpoints used by dossiers page
$endpoints = @(
    "/api/dossiers",
    "/api/dossiers/history",
    "/api/bureaux-representation",
    "/api/bureaux-douaniers",
    "/api/alertes",
    "/api/types-dossiers",
    "/api/users"
)

foreach ($ep in $endpoints) {
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:8000$ep" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "OK 200: $ep"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "ERR $($code): $ep"
    }
}
