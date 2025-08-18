$BASE_URL="https://elegance-dusky.vercel.app"; $COOKIE=""
$h=@{"Content-Type"="application/json"}; if($COOKIE){$h["Cookie"]=$COOKIE}
try{$r=Invoke-WebRequest "$BASE_URL/api/categories" -Headers $h -Method GET -ErrorAction Stop; $r.Content}
catch{$res=$_.Exception.Response;"HTTP $($res.StatusCode.value__)";(New-Object IO.StreamReader($res.GetResponseStream())).ReadToEnd()}
