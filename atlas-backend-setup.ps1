$projectRoot = "C:\Users\User\Documents\New project"
$serverDir = Join-Path $projectRoot "server"
$envPath = Join-Path $serverDir ".env"
$nodePath = "C:\Program Files\nodejs\node.exe"

if (-not (Test-Path $envPath)) {
  Write-Host "Nerastas failas: $envPath" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path $nodePath)) {
  Write-Host "Nerastas Node.js: $nodePath" -ForegroundColor Red
  exit 1
}

$securePassword = Read-Host "Ivesk MongoDB Atlas DB vartotojo slaptazodi" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

if ([string]::IsNullOrWhiteSpace($plainPassword)) {
  Write-Host "Slaptazodis neivestas." -ForegroundColor Red
  exit 1
}

$encodedPassword = [System.Uri]::EscapeDataString($plainPassword)
$atlasUri = "mongodb://rokasberr_db_user:{0}@ac-rbd5rcm-shard-00-00.nh89idb.mongodb.net:27017,ac-rbd5rcm-shard-00-01.nh89idb.mongodb.net:27017,ac-rbd5rcm-shard-00-02.nh89idb.mongodb.net:27017/manoshop?ssl=true&replicaSet=atlas-oxtosp-shard-0&authSource=admin&appName=Cluster0&retryWrites=true&w=majority" -f $encodedPassword
$envLines = Get-Content $envPath

if ($envLines -match "^MONGO_URI=") {
  $envLines = $envLines -replace "^MONGO_URI=.*$", "MONGO_URI=$atlasUri"
} else {
  $envLines += "MONGO_URI=$atlasUri"
}

Set-Content -Path $envPath -Value $envLines

$maskedUri = $atlasUri -replace "(mongodb\+srv://[^:]+:)[^@]+@", '$1********@'
Write-Host ""
Write-Host "Irasyta MONGO_URI:" -ForegroundColor Green
Write-Host $maskedUri
Write-Host ""
Write-Host "Paleidziu backenda..." -ForegroundColor Cyan
Write-Host ""

Push-Location $serverDir
try {
  & $nodePath ".\server.js"
} finally {
  Pop-Location
}
