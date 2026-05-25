# Despliegue en InsForge Hosting (requiere: npx @insforge/cli login previo)
# Uso: .\scripts\deploy-insforge.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$envMap = @{}
if (Test-Path ".env") {
  Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $envMap[$matches[1].Trim()] = $matches[2].Trim()
    }
  }
}

$required = @(
  "NEXT_PUBLIC_INSFORGE_URL",
  "NEXT_PUBLIC_INSFORGE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL"
)
foreach ($key in $required) {
  if (-not $envMap[$key]) {
    Write-Error "Falta $key en .env"
  }
}

if (-not $envMap["INSFORGE_ADMIN_API_KEY"]) {
  Write-Warning "INSFORGE_ADMIN_API_KEY no está en .env: el panel admin no funcionará hasta añadirla (API Key ik_ del dashboard)."
}

$deployEnv = [ordered]@{}
foreach ($key in @($required + @("INSFORGE_ADMIN_API_KEY"))) {
  if ($envMap[$key]) { $deployEnv[$key] = $envMap[$key] }
}
$envJson = $deployEnv | ConvertTo-Json -Compress

$mp4 = Get-ChildItem "$root\public" -Filter "*.mp4" -ErrorAction SilentlyContinue
if ($mp4) {
  Write-Error "Hay MP4 en public/ ($($mp4.Name)). Muévelos fuera del proyecto (p. ej. ../media-local/) antes de desplegar."
}

Write-Host "Desplegando en InsForge..."
npx @insforge/cli deployments deploy $root --env $envJson
