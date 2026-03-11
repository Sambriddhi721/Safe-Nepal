@echo off
echo Starting Expo development server...
echo The QR code will appear below once the server starts.
echo.

cd /d "%~dp0"

REM Start Expo server - this will display the QR code
call npx expo start --clear --lan

pause

