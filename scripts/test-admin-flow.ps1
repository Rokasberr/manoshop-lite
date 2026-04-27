$ErrorActionPreference = "Stop"

$baseApiUrl = "http://localhost:5000/api"
$adminCredentials = @{
  email = "admin@manoshop.lt"
  password = "Admin123!"
}
$customerCredentials = @{
  email = "laura@manoshop.lt"
  password = "Customer123!"
}

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-JsonRequest {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Url,
    [hashtable]$Headers,
    $Body
  )

  $requestArgs = @{
    Method      = $Method
    Uri         = $Url
    Headers     = $Headers
    ErrorAction = "Stop"
  }

  if ($null -ne $Body) {
    $requestArgs.ContentType = "application/json"
    $requestArgs.Body = ($Body | ConvertTo-Json -Depth 10)
  }

  Invoke-RestMethod @requestArgs
}

Write-Step "Tikrinamas backend health"
$health = Invoke-RestMethod -Uri "$baseApiUrl/health" -Method Get
if ($health.status -ne "ok") {
  throw "Backend health nepraejo."
}

Write-Step "Admin prisijungimas"
$adminAuth = Invoke-JsonRequest -Method Post -Url "$baseApiUrl/login" -Body $adminCredentials
$adminHeaders = @{ Authorization = "Bearer $($adminAuth.token)" }

Write-Step "Customer prisijungimas"
$customerAuth = Invoke-JsonRequest -Method Post -Url "$baseApiUrl/login" -Body $customerCredentials
$customerHeaders = @{ Authorization = "Bearer $($customerAuth.token)" }

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$productPayload = @{
  name        = "Codex Test Product $timestamp"
  description = "Automated admin flow validation product."
  price       = 49.99
  category    = "Testing"
  stock       = 7
  featured    = $true
  images      = @("https://example.com/test-product.jpg")
}

Write-Step "Produktas sukuriamas admin teisemis"
$createdProduct = Invoke-JsonRequest -Method Post -Url "$baseApiUrl/products" -Headers $adminHeaders -Body $productPayload

if (-not $createdProduct._id) {
  throw "Produktas nesukurtas."
}

$updatedPayload = @{
  name        = "$($createdProduct.name) Updated"
  description = "Updated automated admin flow validation product."
  price       = 59.99
  category    = "Testing"
  stock       = 11
  featured    = $false
  images      = @("https://example.com/test-product-updated.jpg")
}

Write-Step "Produktas atnaujinamas admin teisemis"
$updatedProduct = Invoke-JsonRequest -Method Put -Url "$baseApiUrl/products/$($createdProduct._id)" -Headers $adminHeaders -Body $updatedPayload

if ($updatedProduct.name -ne $updatedPayload.name -or [decimal]$updatedProduct.price -ne [decimal]$updatedPayload.price) {
  throw "Produkto atnaujinimas nepraejo."
}

$orderPayload = @{
  items = @(
    @{
      product  = $createdProduct._id
      quantity = 2
    }
  )
  shippingAddress = @{
    fullName   = "Laura Pirkeja"
    address    = "Vilniaus g. 1"
    city       = "Vilnius"
    postalCode = "01101"
    country    = "Lietuva"
  }
  paymentMethod = "card"
}

Write-Step "Customer sukuria uzsakyma is produkto"
$createdOrder = Invoke-JsonRequest -Method Post -Url "$baseApiUrl/orders" -Headers $customerHeaders -Body $orderPayload

if (-not $createdOrder._id) {
  throw "Uzsakymas nesukurtas."
}

Write-Step "Customer mato savo uzsakymu istorija"
$userOrders = Invoke-JsonRequest -Method Get -Url "$baseApiUrl/orders/user" -Headers $customerHeaders
if (-not ($userOrders | Where-Object { $_._id -eq $createdOrder._id })) {
  throw "Customer uzsakymo istorijoje nerastas naujas uzsakymas."
}

Write-Step "Admin mato visu uzsakymu sarasa"
$adminOrders = Invoke-JsonRequest -Method Get -Url "$baseApiUrl/orders/admin" -Headers $adminHeaders
if (-not ($adminOrders | Where-Object { $_._id -eq $createdOrder._id })) {
  throw "Admin uzsakymu sarase nerastas naujas uzsakymas."
}

Write-Step "Admin pakeicia uzsakymo statusa i shipped"
$updatedOrder = Invoke-JsonRequest -Method Put -Url "$baseApiUrl/orders/$($createdOrder._id)/status" -Headers $adminHeaders -Body @{ status = "shipped" }
if ($updatedOrder.status -ne "shipped") {
  throw "Uzsakymo statusas neatsinaujino."
}

Write-Step "Customer gali parsisiusti saskaitos PDF"
$invoiceResponse = Invoke-WebRequest -Uri "$baseApiUrl/orders/$($createdOrder._id)/invoice" -Headers $customerHeaders -Method Get -ErrorAction Stop
$contentType = $invoiceResponse.Headers["Content-Type"]
if ($contentType -notlike "application/pdf*") {
  throw "Saskaitos PDF negrazintas."
}

Write-Step "Produktas istrinamas admin teisemis"
$deleteResponse = Invoke-JsonRequest -Method Delete -Url "$baseApiUrl/products/$($createdProduct._id)" -Headers $adminHeaders
if (-not $deleteResponse.message -or $deleteResponse.message -notmatch "i.trintas") {
  throw "Produkto istrynimas nepraejo."
}

Write-Step "Patikrinamas produkto nebuvimas po istrynimo"
try {
  Invoke-JsonRequest -Method Get -Url "$baseApiUrl/products/$($createdProduct._id)" | Out-Null
  throw "Produktas vis dar randamas po istrynimo."
} catch {
  if ($_.Exception.Response -and $_.Exception.Response.StatusCode.value__ -ne 404) {
    throw
  }
}

Write-Host ""
Write-Host "ADMIN FLOW TEST: OK" -ForegroundColor Green
Write-Host "Produktas: $($updatedProduct.name)" -ForegroundColor Green
Write-Host "Uzsakymas: $($createdOrder._id)" -ForegroundColor Green
