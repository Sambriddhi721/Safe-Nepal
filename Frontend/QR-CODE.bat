@echo off
title Expo Development Server - QR Code
color 0A
echo.
echo ========================================
echo   EXPO DEVELOPMENT SERVER - QR CODE
echo ========================================
echo.
echo Starting server... The QR code will appear below:
echo.
echo.

cd /d "%~dp0"
npx expo start --lan --clear --port 8083

pause

