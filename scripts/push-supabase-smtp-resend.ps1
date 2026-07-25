# Pushes Resend SMTP into Supabase Auth (sender: LionXI <noreply@lionxi.co>)
# Requires:
#   SUPABASE_ACCESS_TOKEN  — https://supabase.com/dashboard/account/tokens
#   RESEND_API_KEY         — Resend API key (SMTP password)

$ErrorActionPreference = 'Stop'
$projectRef = 'nzypoiurjqvpohqmbide'

$token = $env:SUPABASE_ACCESS_TOKEN
$resendKey = $env:RESEND_API_KEY
if (-not $token) { Write-Error 'Set SUPABASE_ACCESS_TOKEN' }
if (-not $resendKey) { Write-Error 'Set RESEND_API_KEY' }

$bodyObj = [ordered]@{
  external_email_enabled = $true
  smtp_admin_email       = 'noreply@lionxi.co'
  smtp_host              = 'smtp.resend.com'
  smtp_port              = '587'
  smtp_user              = 'resend'
  smtp_pass              = $resendKey
  smtp_sender_name       = 'LionXI'
}

$body = $bodyObj | ConvertTo-Json -Compress
$headers = @{
  Authorization  = "Bearer $token"
  'Content-Type' = 'application/json'
}

$response = Invoke-RestMethod `
  -Method Patch `
  -Uri "https://api.supabase.com/v1/projects/$projectRef/config/auth" `
  -Headers $headers `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body))

Write-Host 'SMTP updated:'
Write-Host "  sender: $($response.smtp_sender_name) <$($response.smtp_admin_email)>"
Write-Host "  host:   $($response.smtp_host):$($response.smtp_port)"
Write-Host "  user:   $($response.smtp_user)"
