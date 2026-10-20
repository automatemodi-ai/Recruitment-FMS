Add-Type -AssemblyName System.Drawing
$inPath = "C:\Softwares\Modi-furniture\frontend\public\templates\modi-qr.jpg"
$outPath = "C:\Softwares\Modi-furniture\frontend\public\templates\modi-qr.png"
$bmp = [System.Drawing.Bitmap]::FromFile($inPath)
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "QR PNG created successfully"
