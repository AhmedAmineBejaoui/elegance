$BASE_URL = "https://elegance-ten.vercel.app"
$COOKIE   = ""

$headers = @{ "Content-Type"="application/json" }
if ($COOKIE) { $headers["Cookie"] = $COOKIE }

try {
  $r = Invoke-WebRequest -Uri "$BASE_URL/api/categories" -Headers $headers -Method GET -ErrorAction Stop
  Write-Output $r.Content
} catch {
  $res = $_.Exception.Response
  Write-Host "HTTP $($res.StatusCode.value__)"
  (New-Object IO.StreamReader($res.GetResponseStream())).ReadToEnd()
}
