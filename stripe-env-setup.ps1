$projectRoot = "C:\Users\User\Documents\New project"
$serverDir = Join-Path $projectRoot "server"
$envPath = Join-Path $serverDir ".env"

if (-not (Test-Path $envPath)) {
  Write-Host "Nerastas failas: $envPath" -ForegroundColor Red
  exit 1
}

function Read-SecretText {
  param([string]$Prompt)

  $secureValue = Read-Host $Prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)

  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

$secretKey = Read-SecretText "Ivesk STRIPE_SECRET_KEY (sk_test_...) arba palik tuscia"
$webhookSecret = Read-SecretText "Ivesk STRIPE_WEBHOOK_SECRET (whsec_...) arba palik tuscia"
$envLines = Get-Content $envPath

if (-not [string]::IsNullOrWhiteSpace($secretKey)) {
  if ($envLines -match "^STRIPE_SECRET_KEY=") {
    $envLines = $envLines -replace "^STRIPE_SECRET_KEY=.*$", "STRIPE_SECRET_KEY=$secretKey"
  } else {
    $envLines += "STRIPE_SECRET_KEY=$secretKey"
  }
}

if (-not [string]::IsNullOrWhiteSpace($webhookSecret)) {
  if ($envLines -match "^STRIPE_WEBHOOK_SECRET=") {
    $envLines = $envLines -replace "^STRIPE_WEBHOOK_SECRET=.*$", "STRIPE_WEBHOOK_SECRET=$webhookSecret"
  } else {
    $envLines += "STRIPE_WEBHOOK_SECRET=$webhookSecret"
  }
}

Set-Content -Path $envPath -Value $envLines

Write-Host ""
Write-Host "Stripe env atnaujintas." -ForegroundColor Green
Write-Host "Jei backend buvo paleistas anksciau, perleisk serveri is naujo." -ForegroundColor Yellow
