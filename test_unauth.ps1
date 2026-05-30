try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/dossiers" -Method GET -Headers @{Accept="application/json"}
    Write-Host "Status:" $r.StatusCode
    Write-Host "Body:" $r.Content
} catch {
    $code = [int]$_.Exception.Response.StatusCode
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $body = $reader.ReadToEnd()
    Write-Host "Status: $code"
    Write-Host "Body: $body"
    if ($code -eq 401) { Write-Host "OK - returns 401 JSON (not 500)" }
    elseif ($code -eq 500) { Write-Host "STILL BROKEN - returns 500" }
}
