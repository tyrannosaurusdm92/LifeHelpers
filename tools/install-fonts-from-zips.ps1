<#
OurSpace local font installer

This script does NOT download or include any fonts. It only copies font files from ZIPs you already downloaded yourself.

Put these ZIPs next to this script before running:
- magic-school.zip
- morris-roman.zip

Then right-click this file and choose "Run with PowerShell", or run:
powershell -ExecutionPolicy Bypass -File .\install-fonts-from-zips.ps1
#>

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$FontRoot = Join-Path $Root "assets\fonts"
$Temp = Join-Path $ScriptDir "_font_extract_temp"

function Extract-FontZip($ZipName, $DestSubfolder, $Files) {
  $ZipPath = Join-Path $ScriptDir $ZipName
  $Dest = Join-Path $FontRoot $DestSubfolder
  if (!(Test-Path $ZipPath)) {
    Write-Host "Skipping $ZipName - put it next to this script to install it." -ForegroundColor Yellow
    return
  }
  New-Item -ItemType Directory -Force -Path $Dest | Out-Null
  if (Test-Path $Temp) { Remove-Item -Recurse -Force $Temp }
  New-Item -ItemType Directory -Force -Path $Temp | Out-Null
  Expand-Archive -Path $ZipPath -DestinationPath $Temp -Force
  foreach ($File in $Files) {
    $Found = Get-ChildItem -Path $Temp -Recurse -File -Filter $File | Select-Object -First 1
    if ($Found) {
      Copy-Item -Path $Found.FullName -Destination (Join-Path $Dest $File) -Force
      Write-Host "Installed $File to $DestSubfolder" -ForegroundColor Green
    } else {
      Write-Host "Could not find $File inside $ZipName" -ForegroundColor Yellow
    }
  }
}

Extract-FontZip "magic-school.zip" "magic-school" @("MagicSchoolTwo.ttf", "MagicSchoolOne.ttf")
Extract-FontZip "morris-roman.zip" "morris-roman" @("MorrisRoman-Black.ttf", "MorrisRomanAlternate-Black.ttf")

if (Test-Path $Temp) { Remove-Item -Recurse -Force $Temp }
Write-Host "Done. Open index.html to test the profile fonts." -ForegroundColor Cyan
