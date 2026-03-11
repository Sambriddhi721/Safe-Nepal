# Script to show Expo QR code
Write-Host "Starting Expo development server..." -ForegroundColor Green
Write-Host "The QR code will appear below once the server starts." -ForegroundColor Yellow
Write-Host ""

Set-Location $PSScriptRoot

# Start Expo server - this will display the QR code in the terminal
npx expo start --clear --lan

