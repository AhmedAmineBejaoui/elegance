Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
cd $here

Write-Host "=== Products: list ===" -ForegroundColor Cyan
.\products_list.ps1

Write-Host "`n=== Categories: list ===" -ForegroundColor Cyan
.\categories_list.ps1

Write-Host "`n=== Categories: create (NewCat) ===" -ForegroundColor Cyan
.\categories_create.ps1 -Name "NewCat"

Write-Host "`n=== Categories: delete (id=1 - exemple) ===" -ForegroundColor Cyan
.\categories_delete.ps1 -Id 1
