param([int]$Id, [decimal]$Price)

$BASE_URL = "https://elegance-ten.vercel.app"
$COOKIE   = ""

$headers = @{ "Content-Type"="application/json" }
if ($COOKIE) { $headers["Cookie"] = $COOKIE }

$body = @{ price=$Price } | ConvertTo-Json
try {
  $r = Invoke-WebRequest -Uri "$BASE_URL/api/products/$Id" -Headers $headers -Method PUT -Body $body -ErrorAction Stop
  Write-Output $r.Content
} catch {
  $res = $_.Exception.Response
  Write-Host "HTTP $($res.StatusCode.value__)"
  (New-Object IO.StreamReader($res.GetResponseStream())).ReadToEnd()
}
