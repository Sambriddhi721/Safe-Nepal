# Simple QR Code Display Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SafeNepalApp - Connection QR Code" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get your local IP address
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" } | Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    $ipAddress = "192.168.112.1"  # Fallback to the IP we found earlier
}

$port = "8081"
$expoUrl = "exp://$ipAddress`:$port"

Write-Host "Connection URL: $expoUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening QR code in browser..." -ForegroundColor Green
Write-Host ""

# Create a simple HTML file with QR code
$htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>SafeNepalApp QR Code</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
        }
        .container { 
            background: white; 
            padding: 40px; 
            border-radius: 15px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 500px;
        }
        #qrcode { 
            margin: 30px auto; 
            padding: 20px;
            background: #f9f9f9;
            border-radius: 10px;
            display: inline-block;
        }
        .url { 
            font-family: 'Courier New', monospace; 
            background: #f0f0f0; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
            word-break: break-all;
            font-size: 16px;
            border: 2px solid #e0e0e0;
            font-weight: bold;
        }
        h1 { 
            color: #333; 
            margin-bottom: 10px;
        }
        .instructions {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: left;
        }
        .instructions h3 {
            color: #333;
            margin-bottom: 10px;
        }
        .instructions ol {
            color: #666;
            line-height: 1.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔗 SafeNepalApp</h1>
        <p>Scan this QR code with Expo Go:</p>
        <div id="qrcode"></div>
        <div class="url" id="urlDisplay">$expoUrl</div>
        <p><strong>Or enter the URL above manually</strong></p>
        
        <div class="instructions">
            <h3>📱 How to Connect:</h3>
            <ol>
                <li>Open <strong>Expo Go</strong> app on your phone</li>
                <li>Tap <strong>"Scan QR Code"</strong></li>
                <li>Point camera at the QR code above</li>
                <li>Or manually enter: <code>$expoUrl</code></li>
            </ol>
        </div>
    </div>
    <script>
        const expoUrl = '$expoUrl';
        QRCode.toCanvas(document.getElementById('qrcode'), expoUrl, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, function (error) {
            if (error) {
                console.error(error);
                document.getElementById('qrcode').innerHTML = '<p style="color:red;">Error generating QR code. Use the URL manually: ' + expoUrl + '</p>';
            }
        });
    </script>
</body>
</html>
"@

$htmlPath = Join-Path $PSScriptRoot "qr-code-display.html"
$htmlContent | Out-File -FilePath $htmlPath -Encoding UTF8

# Open in browser
Start-Process $htmlPath

Write-Host "QR code opened in your default browser!" -ForegroundColor Green
Write-Host ""
Write-Host "If the QR code doesn't work, make sure:" -ForegroundColor Yellow
Write-Host "  1. Your phone and computer are on the same WiFi network" -ForegroundColor Yellow
Write-Host "  2. Expo server is running (npx expo start)" -ForegroundColor Yellow
Write-Host "  3. Use the URL: $expoUrl" -ForegroundColor Yellow
Write-Host ""
