git add .
git commit -m "your message"
git push origin main



$Url = "https://skina-review-kiosk-v2.vercel.app/"
$Out = "skina-review-qr.png"
Invoke-WebRequest -Uri ("https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=" + [uri]::EscapeDataString($Url)) -OutFile $Out
Write-Host "Saved QR to $Out"
