param([string]$Name="X",[decimal]$Price=10,[int]$CategoryId=1)
$BASE_URL="https://elegance-dusky.vercel.app"; $COOKIE=""
$h=@{"Content-Type"="application/json"}; if($COOKIE){$h["Cookie"]=$COOKIE}
$body=@{name=$Name;price=$Price;categoryId=$CategoryId}|ConvertTo-Json
try{$r=Invoke-WebRequest "$BASE_URL/api/products" -Headers $h -Method POST -Body $body -ErrorAction Stop; $r.Content}
catch{$res=$_.Exception.Response;"HTTP $($res.StatusCode.value__)";(New-Object IO.StreamReader($res.GetResponseStream())).ReadToEnd()}
