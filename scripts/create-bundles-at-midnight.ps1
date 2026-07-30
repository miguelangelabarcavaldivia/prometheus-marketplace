$token = "foqpjLgSPrZjP_OXP2tRXTpoC7U-KbktqNvEFaCLqcA"
$utcNow = [DateTime]::UtcNow
$midnightUtc = $utcNow.Date.AddDays(1)
$waitSeconds = ($midnightUtc - $utcNow).TotalSeconds
Write-Output "[$(Get-Date)] Waiting $waitSeconds seconds until midnight UTC..."
Start-Sleep -Seconds $waitSeconds

Write-Output "[$(Get-Date)] Rate limit reset! Creating remaining bundles..."

# Bundle 1: RAG + Curso
$desc1 = "🚀 RAG + Curso Bundle — Domina el procesamiento de lenguaje`n`n✅ RAG System Template (`$39) — QA sobre documentos con LangChain`n✅ Prompt Engineering Avanzado (`$29) — Curso para desarrolladores`n`n🔥 Ahorra `$9 vs comprar por separado (`$68 → `$59)`n`n✅ Contenido incluido:`n- Sistema RAG completo con LangChain`n- 8 módulos de curso con 120+ páginas`n- Cheatsheet de técnicas de prompting para RAG`n- Calculadora de costos de LLMs`n`n📥 Descarga inmediata."

$body1 = "access_token=$token&name=RAG + Curso Bundle&price=5900&description=$desc1&customizable_price=true&native_type=bundle"
$result1 = Invoke-RestMethod -Uri "https://api.gumroad.com/v2/products" -Method Post -Body $body1 -ErrorAction SilentlyContinue
if ($result1.success) {
    Write-Output "[$(Get-Date)] ✅ Created RAG + Curso Bundle: $($result1.product.id)"
    Invoke-RestMethod -Uri "https://api.gumroad.com/v2/products/$($result1.product.id)/enable" -Method Put -Body "access_token=$token"
} else {
    Write-Output "[$(Get-Date)] ❌ RAG + Curso Bundle failed: $($result1.message)"
}

# Bundle 2: Prompt Pro
$desc2 = "🚀 Prompt Pro Bundle — Domina el prompt engineering`n`n✅ Prompt Engineering Playbook (`$19) — 200+ prompts para devs`n✅ Curso de Prompt Engineering Avanzado (`$29) — 8 módulos, 120+ páginas`n`n🔥 Ahorra `$9 vs comprar por separado (`$48 → `$39)`n`n📦 Incluye:`n- 200+ prompts organizados por categoría`n- 8 módulos de curso con ejercicios prácticos`n- Cheatsheet de técnicas de prompting`n- Calculadora de costos de LLMs`n`n📥 Descarga inmediata."

$body2 = "access_token=$token&name=Prompt Pro Bundle&price=3900&description=$desc2&customizable_price=true&native_type=bundle"
$result2 = Invoke-RestMethod -Uri "https://api.gumroad.com/v2/products" -Method Post -Body $body2 -ErrorAction SilentlyContinue
if ($result2.success) {
    Write-Output "[$(Get-Date)] ✅ Created Prompt Pro Bundle: $($result2.product.id)"
    Invoke-RestMethod -Uri "https://api.gumroad.com/v2/products/$($result2.product.id)/enable" -Method Put -Body "access_token=$token"
} else {
    Write-Output "[$(Get-Date)] ❌ Prompt Pro Bundle failed: $($result2.message)"
}

Write-Output "[$(Get-Date)] ✅ Bundle creation complete!"
