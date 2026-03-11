# PowerShell script to start Expo development server
# This will start the server and allow the app to connect

Write-Host "Starting Expo development server..." -ForegroundColor Green
Write-Host "Make sure your phone and computer are on the same Wi-Fi network" -ForegroundColor Yellow
Write-Host ""

# Navigate to the app directory
Set-Location $PSScriptRoot

# Start Expo with tunnel mode for better connectivity (optional)
# Use --tunnel if you have connectivity issues
# Use --lan for local network (faster, requires same Wi-Fi)

# Option 1: Start with LAN (faster, requires same Wi-Fi network)
Write-Host "Starting with LAN mode..." -ForegroundColor Cyan
npx expo start --clear --lan

# Option 2: If LAN doesn't work, use tunnel mode (uncomment below and comment above)
# Write-Host "Starting with Tunnel mode..." -ForegroundColor Cyan
# npx expo start --clear --tunnel

