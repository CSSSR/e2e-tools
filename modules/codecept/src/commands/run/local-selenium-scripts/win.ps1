Function Test-CommandExists
{
    Param ($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try {if(Get-Command $command){RETURN $true}}
    Catch {Write-Host "$command does not exist"; RETURN $false}
    Finally {$ErrorActionPreference=$oldPreference}
} #end function test-CommandExists

# Install choco if not exists
if(!(Test-CommandExists choco)) {
    Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

if(!(Test-CommandExists java)) {
    Invoke-Expression "choco install jre8"
}

# Download selenium
New-Item -ItemType Directory -Force -Path "./bin" | Out-Null
Set-Location -Path "./bin" | Out-Null

$selenium = "selenium-server-4.2.1.jar"
if (!(Test-Path -Path $selenium -PathType Leaf)) {
    Invoke-WebRequest -Uri "https://github.com/SeleniumHQ/selenium/releases/download/selenium-4.2.0/selenium-server-4.2.1.jar" -OutFile "selenium-server-4.2.1.jar"
}

# Download chromedriver
$chromeVersion = (Get-Item (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe').'(Default)').VersionInfo.FileVersion
$majorChromeVersion = $chromeVersion.Split(".")[0]

$chromedriver = "chromedriver.exe"
if (!(Test-Path -Path $chromedriver -PathType Leaf)) {
    switch ($majorChromeVersion) {
        "101" { $fullVersion = "101.0.4951.41"}
        "102" { $fullVersion = "102.0.5005.61"}
        "103" { $fullVersion = "103.0.5060.24"}
    }
    Invoke-WebRequest -Uri ("https://chromedriver.storage.googleapis.com/{0}/chromedriver_win32.zip" -f $fullVersion) -OutFile "chromedriver_win32.zip"
    Expand-Archive "chromedriver_win32.zip" -DestinationPath "./"
}

# Download firefoxdriver
$firefoxdriver = "geckodriver.exe"
if (!(Test-Path -Path $firefoxdriver -PathType Leaf)) {
    Invoke-WebRequest -Uri "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-win32.zip" -OutFile "geckodriver-v0.31.0-win32.zip"
    Expand-Archive "geckodriver-v0.31.0-win32.zip" -DestinationPath "./"
}

Invoke-Expression "java -jar selenium-server-4.2.1.jar standalone"