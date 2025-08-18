param([int]$Id,[decimal]$Price)
$BASE_URL="https://elegance-dusky.vercel.app"; $COOKIE=""
$h=@{"Content-Type"="application/json"}; if($COOKIE){$h["Cookie"]=$COOKIE}
$body=@{price=$Price}|ConvertTo-Json
try{$r=Invoke-WebRequest "$BASE_URL/api/products/$Id" -Headers $h -Method PUT -Body $body -ErrorAction Stop; $r.Content}
catch{$res=$_.Exception.Response;"HTTP $($res.StatusCode.value__)";(New-Object IO.StreamReader($res.GetResponseStream())).ReadToEnd()}
