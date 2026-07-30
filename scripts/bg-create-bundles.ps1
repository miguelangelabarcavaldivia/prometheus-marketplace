$token = "foqpjLgSPrZjP_OXP2tRXTpoC7U-KbktqNvEFaCLqcA"
$utcNow = [DateTime]::UtcNow
$midnightUtc = $utcNow.Date.AddDays(1)
$waitSeconds = ($midnightUtc - $utcNow).TotalSeconds
[System.Threading.Thread]::Sleep([int]($waitSeconds * 1000))

# Now create the 2 remaining bundles
$env:GUMROAD_ACCESS_TOKEN = $token

# Bundle 1: RAG + Curso Bundle
$body1 = @{
  access_token = $token
  name = "RAG + Curso Bundle — RAG + Prompt Avanzado"
  price = "5900"
  description = "🚀 RAG + Curso Bundle — Domina el procesamiento de lenguaje

✅ RAG System Template ($39) — QA sobre documentos con LangChain
✅ Prompt Engineering Avanzado ($29) — Curso para desarrolladores

🔥 Ahorra $9 vs comprar por separado ($68 → $59)

✅ Contenido incluido:
- Sistema RAG completo con LangChain
- 8 módulos de curso con 120+ páginas
- Cheatsheet de técnicas de prompting para RAG
- Calculadora de costos de LLMs

📥 Descarga inmediata."
  customizable_price = "true"
  suggested_price = "5900"
  native_type = "bundle"
  "tags[]" = "bundle"
}
# Need to handle tags array properly
$body1Params = "access_token=$token&name=RAG + Curso Bundle — RAG + Prompt Avanzado&price=5900&description=🚀 RAG + Curso Bundle — Domina el procesamiento de lenguaje&customizable_price=true&suggested_price=5900&native_type=bundle&tags[]=bundle&tags[]=rag&tags[]=prompts&tags[]=course"

# Use curl for reliability
$desc1 = "🚀 RAG + Curso Bundle — Domina el procesamiento de lenguaje`n`n✅ RAG System Template ($39) — QA sobre documentos con LangChain`n✅ Prompt Engineering Avanzado ($29) — Curso para desarrolladores`n`n🔥 Ahorra $9 vs comprar por separado ($68 → $59)`n`n✅ Contenido incluido:`n- Sistema RAG completo con LangChain`n- 8 módulos de curso con 120+ páginas`n- Cheatsheet de técnicas de prompting para RAG`n- Calculadora de costos de LLMs`n`n📥 Descarga inmediata."

$result1 = Invoke-RestMethod -Uri "https://api.gumroad.com/v2/products" -Method Post -Body @{
  access_token = $token
  name = "RAG + Curso Bundle — RAG + Prompt Avanzado"
  price = "5900"
  description = $desc1
  customizable_price = "true"
  suggested_price = "5900"
  native_type = "bundle"
  "tags[]" = @("bundle", "rag", "prompts", "course")
} -ErrorAction SilentlyContinue

if ($result1.success) {
  Write-Output "✅ Created RAG + Curso Bundle: $($result1.product.id)"
  # Enable
  Invoke-RestMethod -Uri "https://api.gumroad.com/v2/products/$($result1.product.id)/enable" -Method Put -Body @{access_token=$token}
} else {
  Write-Output "❌ RAG + Curso Bundle failed: $($result1 | ConvertTo-Json)"
}

# Bundle 2: Prompt Pro Bundle
$desc2 = "🚀 Prompt Pro Bundle — Domina el prompt engineering`n`n✅ Prompt Engineering Playbook ($19) — 200+ prompts para devs`n✅ Curso de Prompt Engineering Avanzado ($29) — 8 módulos, 120+ páginas`n`n🔥 Ahorra $9 vs comprar por separado ($48 → $39)`n`n📦 Incluye:`n- 200+ prompts organizados por categoría`n- 8 módulos de curso con ejercicios prácticos`n- Cheatsheet de técnicas de prompting`n- Calculadora de costos de LLMs`n`n📥 Descarga inmediata."

$result2 = Invoke-RestMethod -Uri "https://api.gumroad.com/v2/products" -Method Post -Body @{
  access_token = $token
  name = "Prompt Pro Bundle — Playbook + Curso Avanzado"
  price = "3900"
  description = $desc2
  customizable_price = "true"
  suggested_price = "3900"
  native_type = "bundle"
  "tags[]" = @("bundle", "prompts", "prompt-engineering", "course")
} -ErrorAction SilentlyContinue

if ($result2.success) {
  Write-Output "✅ Created Prompt Pro Bundle: $($result2.product.id)"
  # Enable
  Invoke-RestMethod -Uri "https://api.gumroad.com/v2/products/$($result2.product.id)/enable" -Method Put -Body @{access_token=$token}
} else {
  Write-Output "❌ Prompt Pro Bundle failed: $($result2 | ConvertTo-Json)"
}

Write-Output "✅ Bundle creation complete!"
