# Pushes auth Site URL + redirect URLs from supabase/config.toml
# Requires: https://supabase.com/dashboard/account/tokens → SUPABASE_ACCESS_TOKEN

$ErrorActionPreference = 'Stop'
$projectRef = 'nzypoiurjqvpohqmbide'
$siteUrl = 'https://england-wc30-squad-builder.vercel.app'
$redirectUrls = @(
  'https://england-wc30-squad-builder.vercel.app/**',
  'http://localhost:5173/**'
) -join ','

$token = $env:SUPABASE_ACCESS_TOKEN
if (-not $token) {
  Write-Error 'Set SUPABASE_ACCESS_TOKEN (Supabase Dashboard → Account → Access Tokens)'
}

$body = @{
  site_url = $siteUrl
  uri_allow_list = $redirectUrls
} | ConvertTo-Json

$headers = @{
  Authorization = "Bearer $token"
  'Content-Type' = 'application/json'
}

$response = Invoke-RestMethod `
  -Method Patch `
  -Uri "https://api.supabase.com/v1/projects/$projectRef/config/auth" `
  -Headers $headers `
  -Body $body

Write-Host "Auth config updated. Site URL: $($response.site_url)"
