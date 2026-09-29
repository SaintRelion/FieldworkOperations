Add-Type -AssemblyName System.Drawing
$assetDirectory = Join-Path $PSScriptRoot '../public'
function Draw-OrbitArc($graphics, $pen, [double]$startX, [double]$startY, [double]$endX, [double]$endY) {
    $dx = ($startX - $endX) / 2
    $dy = ($startY - $endY) / 2
    $factor = [Math]::Sqrt((100 - $dx * $dx - $dy * $dy) / ($dx * $dx + $dy * $dy))
    $centerX = ($startX + $endX) / 2 + $factor * $dy
    $centerY = ($startY + $endY) / 2 - $factor * $dx
    $startAngle = [Math]::Atan2($startY - $centerY, $startX - $centerX) * 180 / [Math]::PI
    $endAngle = [Math]::Atan2($endY - $centerY, $endX - $centerX) * 180 / [Math]::PI
    $sweep = ($endAngle - $startAngle + 360) % 360
    $graphics.DrawArc($pen, [single]($centerX - 10), [single]($centerY - 10), [single]20, [single]20, [single]$startAngle, [single]$sweep)
}
foreach ($iconSize in @(180, 192, 512)) {
    $renderSize = $iconSize * 4
    $bitmap = New-Object System.Drawing.Bitmap($renderSize, $renderSize)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#1677ff'))
    $scale = $renderSize * (20.0 / 36) / 24
    $graphics.TranslateTransform([single]($renderSize / 2.0 - 12 * $scale), [single]($renderSize / 2.0 - 12 * $scale))
    $graphics.ScaleTransform([single]$scale, [single]$scale)
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [single]2.2)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    Draw-OrbitArc $graphics $pen 20.341 6.484 10.266 21.85
    Draw-OrbitArc $graphics $pen 3.659 17.516 13.74 2.152
    $graphics.DrawEllipse($pen, [single]9, [single]9, [single]6, [single]6)
    $graphics.DrawEllipse($pen, [single]17, [single]3, [single]4, [single]4)
    $graphics.DrawEllipse($pen, [single]3, [single]17, [single]4, [single]4)
    $output = New-Object System.Drawing.Bitmap($iconSize, $iconSize)
    $outputGraphics = [System.Drawing.Graphics]::FromImage($output)
    $outputGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $outputGraphics.DrawImage($bitmap, 0, 0, $iconSize, $iconSize)
    $filename = if ($iconSize -eq 180) { 'apple-touch-icon.png' } else { "fieldwork-$iconSize.png" }
    $output.Save((Join-Path $assetDirectory $filename), [System.Drawing.Imaging.ImageFormat]::Png)
    $outputGraphics.Dispose()
    $output.Dispose()
    $pen.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
}
