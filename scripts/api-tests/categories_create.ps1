param([string]$Name)

$BASE_URL = "https://elegance-ten.vercel.app"
$COOKIE   = ""

$headers = @{ "Content-Type"="application/json" }
if ($COOKIE) { $headers["Cookie"] = $COOKIE }

$body = @{ name=$Name } | ConvertTo-Json
try {
  $r = Invoke-WebRequest -Uri "$BASE_URL/api/categories" -Headers $headers -Method POST -Body $body -ErrorAction Stop
  Write-Output $r.Content
} catch {
  $res = $_.Exception.Response
  Write-Host "HTTP $($res.StatusCode.value__)"
  (New-Object IO.StreamReader($res.GetResponseStream())).ReadToEnd()
}
