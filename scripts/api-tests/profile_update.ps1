param([string]$FirstName,[string]$LastName="",[string]$Phone="",[string]$Address="",[string]$City="",[string]$PostalCode="")
$BASE_URL="https://elegance-dusky.vercel.app"; $COOKIE=""  # mettre les cookies si nécessaire
$h=@{"Content-Type"="application/json"}; if($COOKIE){$h["Cookie"]=$COOKIE}
$body=@{firstName=$FirstName;lastName=$LastName;phone=$Phone;address=$Address;city=$City;postalCode=$PostalCode}|ConvertTo-Json
try{$r=Invoke-WebRequest "$BASE_URL/api/auth/profile" -Headers $h -Method PATCH -Body $body -ErrorAction Stop; $r.Content}
catch{$res=$_.Exception.Response;"HTTP $($res.StatusCode.value__)";(New-Object IO.StreamReader($res.GetResponseStream())).ReadToEnd()}
