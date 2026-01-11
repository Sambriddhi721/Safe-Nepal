@echo off
REM Batch script to start Expo development server
echo Starting Expo development server...
echo Make sure your phone and computer are on the same Wi-Fi network
echo.

cd /d "%~dp0"

REM Start Expo with LAN mode
echo Starting with LAN mode...
call npx expo start --clear --lan

REM Alternative: Use tunnel mode if LAN doesn't work
REM call npx expo start --clear --tunnel

pause

