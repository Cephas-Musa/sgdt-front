$phoneNumber = "+243813478556"

$otpBody = "{`"phone_number`":`"$phoneNumber`",`"code`":`"000000`"}"
$otpResp = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/verify-otp" -Method POST -ContentType "application/json" -Body $otpBody
$token = $otpResp.access_token
$headers = @{ Authorization = "Bearer $token"; Accept = "application/json" }

$endpoints = @(
    "/api/config/types-dossiers",
    "/api/config/representation-offices",
    "/api/config/customs-offices",
    "/api/alertes"
)

foreach ($ep in $endpoints) {
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:8000$ep" -Method GET -Headers $headers -ErrorAction Stop
        Write-Host "OK 200: $ep ($($resp.Count))"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "ERR $($code): $ep"
    }
}
