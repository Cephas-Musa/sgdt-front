try {
    $body = '{"phone_number":"+243813478556","password":"password"}'
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/login" -Method POST -ContentType "application/json" -Body $body
    Write-Host "Status:" $r.StatusCode
    Write-Host "Body:" $r.Content
} catch {
    Write-Host "Status:" $_.Exception.Response.StatusCode
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Error:" $reader.ReadToEnd()
}
