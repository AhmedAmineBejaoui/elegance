param([string]$FirstName, [string]$LastName="", [string]$Phone="", [string]$Address="", [string]$City="", [string]$PostalCode="")

$BASE_URL = "https://elegance-ten.vercel.app"
$COOKIE   = ""  # nécessaire si l'endpoint exige une session (401 sinon)

$headers = @{ "Content-Type"="application/json" }
if ($COOKIE) { $headers["Cookie"] = $COOKIE }

$body = @{
  firstName = $FirstName; lastName = $LastName; phone = $Phone
  address = $Address; city = $City; postalCode = $PostalCode
} | ConvertTo-Json

try {
  $r = Invoke-WebRequest -Uri "$BASE_URL/api/auth/profile" -Headers $headers -Method PATCH -Body $body -ErrorAction Stop
  Write-Output $r.Content
} catch {
  $res = $_.Exception.Response
  Write-Host "HTTP $($res.StatusCode.value__)"
  (New-Object IO.StreamReader($res.GetResponseStream())).ReadToEnd()
}
