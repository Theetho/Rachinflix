Clear-Host
Set-Location "D:/TaskBar Shortcuts/rachinflix-v2.0.0/server"
Write-Host "Deleting previous build..." -ForegroundColor Yellow
Remove-Item -Recurse -Path "./public/build"
Write-Host "Building server..." -ForegroundColor Green
npm run build | out-null
Set-Location "../client"
Write-Host "Building client..." -ForegroundColor Green
npm run build | out-null
Copy-Item -Recurse -Path './build' -Destination "../server/public/build"
Set-Location "D:/TaskBar Shortcuts/rachinflix-v2.0.0"
Write-Host "Build complete." -ForegroundColor Green