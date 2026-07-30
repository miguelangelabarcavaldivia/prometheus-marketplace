# Check if it's past midnight UTC (rate limit reset)
$utcNow = [DateTime]::UtcNow
$rateLimitReset = $utcNow.Date.AddDays(1)  # Next midnight UTC

Write-Host "Current UTC: $utcNow"
Write-Host "Rate limit resets at: $rateLimitReset"
Write-Host "Time remaining: $($rateLimitReset - $utcNow)"

if ($utcNow -ge $rateLimitReset) {
    Write-Host "✅ Rate limit has reset! Running bundle creation..."
    $env:GUMROAD_ACCESS_TOKEN = "foqpjLgSPrZjP_OXP2tRXTpoC7U-KbktqNvEFaCLqcA"
    node "D:\Prometheus_IA_Dev_Marketplace\scripts\create-remaining-bundles.mjs"
} else {
    Write-Host "⏳ Rate limit not yet reset. Waiting until midnight UTC..."
    $waitSeconds = ($rateLimitReset - $utcNow).TotalSeconds
    Write-Host "Waiting $([Math]::Floor($waitSeconds)) seconds..."
    Start-Sleep -Seconds $waitSeconds
    Write-Host "✅ Rate limit has reset! Running bundle creation..."
    $env:GUMROAD_ACCESS_TOKEN = "foqpjLgSPrZjP_OXP2tRXTpoC7U-KbktqNvEFaCLqcA"
    node "D:\Prometheus_IA_Dev_Marketplace\scripts\create-remaining-bundles.mjs"
}
