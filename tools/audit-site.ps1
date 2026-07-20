$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$requiredPages = @(
    'index.html','about.html','all-services.html','gallery.html','contact.html',
    'residential-landscape-design.html','commercial-landscape-design.html','front-yard-design.html',
    'backyard-design.html','garden-planting-plans.html','patio-walkway-design.html',
    'outdoor-lighting.html','3d-landscape-visualization.html','privacy-policy.html',
    'terms-of-service.html','cookie-policy.html','404.html'
)
$errors = [System.Collections.Generic.List[string]]::new()

foreach ($page in $requiredPages) {
    $path = Join-Path $root $page
    if (-not (Test-Path -LiteralPath $path)) { $errors.Add("Missing page: $page"); continue }
    $html = Get-Content -Raw -LiteralPath $path
    if ($html -notmatch '<title>[^<]+</title>') { $errors.Add("Missing title: $page") }
    if (($html | Select-String -Pattern '<h1\b' -AllMatches).Matches.Count -ne 1) { $errors.Add("Expected one H1: $page") }
    if ($html -match 'href\s*=\s*["'']\s*(#|)["'']') { $errors.Add("Empty or hash-only link: $page") }
    if ($html -match '<style\b|\sstyle\s*=') { $errors.Add("Inline style found: $page") }
    $ids = [regex]::Matches($html, '\sid=["'']([^"'']+)["'']') | ForEach-Object { $_.Groups[1].Value }
    $ids | Group-Object | Where-Object Count -gt 1 | ForEach-Object { $errors.Add("Duplicate ID '$($_.Name)' in $page") }
    [regex]::Matches($html, '<script\b[^>]*type=["'']application/ld\+json["''][^>]*>(.*?)</script>', [Text.RegularExpressions.RegexOptions]::Singleline) | ForEach-Object {
        try { $_.Groups[1].Value | ConvertFrom-Json | Out-Null } catch { $errors.Add("Invalid JSON-LD in $page") }
    }
    [regex]::Matches($html, '<img\b[^>]*>') | ForEach-Object {
        if ($_.Value -notmatch '\bwidth=["'']\d+' -or $_.Value -notmatch '\bheight=["'']\d+') { $errors.Add("Image without dimensions in $page") }
        if ($_.Value -notmatch '\balt=["'']') { $errors.Add("Image without alt in $page") }
    }
    [regex]::Matches($html, '<(?:input|select|textarea)\b[^>]*>') | ForEach-Object {
        $control = $_.Value
        if ($control -match '<input\b[^>]*\btype=["'']hidden["'']') { return }
        if ($control -notmatch '\bid=["'']([^"'']+)["'']') { $errors.Add("Form control without ID in $page"); return }
        $controlIdRaw = $Matches[1]
        $controlId = [regex]::Escape($controlIdRaw)
        $labelPattern = '<label\b[^>]*\bfor=["'']' + $controlId + '["'']'
        if ($html -notmatch $labelPattern) { $errors.Add("Form control without label for '$controlIdRaw' in $page") }
    }
    [regex]::Matches($html, '(?:href|src)=["'']([^"'']+)["'']') | ForEach-Object {
        $ref = $_.Groups[1].Value
        if ($ref -match '^(?:https?:|mailto:|#|data:)') { return }
        $target = ($ref -split '#')[0]
        if ($target -and -not (Test-Path -LiteralPath (Join-Path $root $target))) { $errors.Add("Broken local reference '$ref' in $page") }
    }
    [regex]::Matches($html, 'srcset=["'']([^"'']+)["'']') | ForEach-Object {
        $_.Groups[1].Value -split ',' | ForEach-Object {
            $ref = ($_ -split '\s+')[0].Trim()
            if ($ref -and $ref -notmatch '^(?:https?:|data:)' -and -not (Test-Path -LiteralPath (Join-Path $root $ref))) {
                $errors.Add("Broken srcset reference '$ref' in $page")
            }
        }
    }
}

try { Get-Content -Raw -LiteralPath (Join-Path $root 'config/site.json') | ConvertFrom-Json | Out-Null } catch { $errors.Add('config/site.json is not valid JSON') }
if (-not (Test-Path -LiteralPath (Join-Path $root 'contact.php'))) { $errors.Add('Missing contact.php') }

Get-ChildItem -LiteralPath (Join-Path $root 'assets/css') -Filter '*.css' -Recurse | ForEach-Object {
    $stylesheet = $_
    $css = Get-Content -Raw -LiteralPath $stylesheet.FullName
    [regex]::Matches($css, 'url\(([^)]+)\)') | ForEach-Object {
        $ref = $_.Groups[1].Value.Trim().Trim('"', "'")
        if ($ref -and $ref -notmatch '^(?:https?:|data:|#)' -and -not (Test-Path -LiteralPath (Join-Path $stylesheet.DirectoryName $ref))) {
            $errors.Add("Broken CSS reference '$ref' in $($stylesheet.Name)")
        }
    }
}

Get-ChildItem -LiteralPath (Join-Path $root 'assets/js') -Filter '*.js' -Recurse | ForEach-Object {
    $script = $_
    $source = Get-Content -Raw -LiteralPath $script.FullName
    [regex]::Matches($source, '(?:from\s*|import\s*\()["''](\.{1,2}/[^"'']+)["'']') | ForEach-Object {
        $ref = $_.Groups[1].Value
        if (-not (Test-Path -LiteralPath (Join-Path $script.DirectoryName $ref))) {
            $errors.Add("Broken JavaScript import '$ref' in $($script.Name)")
        }
    }
}

if ($errors.Count) {
    $errors | Sort-Object -Unique | ForEach-Object { Write-Host "ERROR: $_" -ForegroundColor Red }
    exit 1
}
Write-Host "Verdeon structural audit passed for $($requiredPages.Count) HTML pages." -ForegroundColor Green
