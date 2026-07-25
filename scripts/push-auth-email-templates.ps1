# Pushes all LionXI-branded Supabase Auth email templates (+ enables security notifications)
# Requires: SUPABASE_ACCESS_TOKEN from https://supabase.com/dashboard/account/tokens
# Optional: rebuild HTML first with scripts/build-auth-email-templates.ps1

$ErrorActionPreference = 'Stop'
$projectRef = 'nzypoiurjqvpohqmbide'
$root = Split-Path -Parent $PSScriptRoot

$token = $env:SUPABASE_ACCESS_TOKEN
if (-not $token) {
  Write-Error 'Set SUPABASE_ACCESS_TOKEN (Supabase Dashboard → Account → Access Tokens)'
}

function Read-Template([string]$name) {
  $path = Join-Path $root "supabase/templates/$name.html"
  if (-not (Test-Path $path)) {
    Write-Error "Missing template: $path (run scripts/build-auth-email-templates.ps1 first)"
  }
  return (Get-Content -Raw -Path $path).Trim()
}

$bodyObj = [ordered]@{
  # Auth action emails
  mailer_subjects_confirmation          = 'Confirm your LionXI account'
  mailer_templates_confirmation_content = (Read-Template 'confirmation')
  mailer_subjects_recovery              = 'Reset your LionXI password'
  mailer_templates_recovery_content     = (Read-Template 'recovery')
  mailer_subjects_magic_link            = 'Your LionXI sign-in link'
  mailer_templates_magic_link_content   = (Read-Template 'magic_link')
  mailer_subjects_invite                = 'You''re invited to LionXI'
  mailer_templates_invite_content       = (Read-Template 'invite')
  mailer_subjects_email_change          = 'Confirm your new LionXI email'
  mailer_templates_email_change_content = (Read-Template 'email_change')
  mailer_subjects_reauthentication      = '{{ .Token }} is your LionXI verification code'
  mailer_templates_reauthentication_content = (Read-Template 'reauthentication')

  # Security notifications — enable + brand
  mailer_notifications_password_changed_enabled = $true
  mailer_subjects_password_changed_notification = 'Your LionXI password was changed'
  mailer_templates_password_changed_notification_content = (Read-Template 'password_changed_notification')

  mailer_notifications_email_changed_enabled = $true
  mailer_subjects_email_changed_notification = 'Your LionXI email address was changed'
  mailer_templates_email_changed_notification_content = (Read-Template 'email_changed_notification')

  mailer_notifications_phone_changed_enabled = $true
  mailer_subjects_phone_changed_notification = 'Your LionXI phone number was changed'
  mailer_templates_phone_changed_notification_content = (Read-Template 'phone_changed_notification')

  mailer_notifications_mfa_factor_enrolled_enabled = $true
  mailer_subjects_mfa_factor_enrolled_notification = 'A LionXI verification method was added'
  mailer_templates_mfa_factor_enrolled_notification_content = (Read-Template 'mfa_factor_enrolled_notification')

  mailer_notifications_mfa_factor_unenrolled_enabled = $true
  mailer_subjects_mfa_factor_unenrolled_notification = 'A LionXI verification method was removed'
  mailer_templates_mfa_factor_unenrolled_notification_content = (Read-Template 'mfa_factor_unenrolled_notification')

  mailer_notifications_identity_linked_enabled = $true
  mailer_subjects_identity_linked_notification = 'A LionXI sign-in method was linked'
  mailer_templates_identity_linked_notification_content = (Read-Template 'identity_linked_notification')

  mailer_notifications_identity_unlinked_enabled = $true
  mailer_subjects_identity_unlinked_notification = 'A LionXI sign-in method was removed'
  mailer_templates_identity_unlinked_notification_content = (Read-Template 'identity_unlinked_notification')
}

$body = $bodyObj | ConvertTo-Json -Depth 5 -Compress
$headers = @{
  Authorization  = "Bearer $token"
  'Content-Type' = 'application/json'
}

$response = Invoke-RestMethod `
  -Method Patch `
  -Uri "https://api.supabase.com/v1/projects/$projectRef/config/auth" `
  -Headers $headers `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body))

Write-Host 'Auth email templates updated:'
@(
  'confirmation',
  'recovery',
  'magic_link',
  'invite',
  'email_change',
  'reauthentication',
  'password_changed_notification',
  'email_changed_notification',
  'phone_changed_notification',
  'mfa_factor_enrolled_notification',
  'mfa_factor_unenrolled_notification',
  'identity_linked_notification',
  'identity_unlinked_notification'
) | ForEach-Object {
  $subjProp = "mailer_subjects_$_"
  # API uses slightly different names for notification subjects
  $val = $response.$subjProp
  if (-not $val) {
    $alt = "mailer_subjects_$($_.Replace('_notification','_notification'))"
    $val = $response.$alt
  }
  # Map file name → response property
  switch ($_) {
    'confirmation' { $val = $response.mailer_subjects_confirmation }
    'recovery' { $val = $response.mailer_subjects_recovery }
    'magic_link' { $val = $response.mailer_subjects_magic_link }
    'invite' { $val = $response.mailer_subjects_invite }
    'email_change' { $val = $response.mailer_subjects_email_change }
    'reauthentication' { $val = $response.mailer_subjects_reauthentication }
    'password_changed_notification' { $val = $response.mailer_subjects_password_changed_notification }
    'email_changed_notification' { $val = $response.mailer_subjects_email_changed_notification }
    'phone_changed_notification' { $val = $response.mailer_subjects_phone_changed_notification }
    'mfa_factor_enrolled_notification' { $val = $response.mailer_subjects_mfa_factor_enrolled_notification }
    'mfa_factor_unenrolled_notification' { $val = $response.mailer_subjects_mfa_factor_unenrolled_notification }
    'identity_linked_notification' { $val = $response.mailer_subjects_identity_linked_notification }
    'identity_unlinked_notification' { $val = $response.mailer_subjects_identity_unlinked_notification }
  }
  Write-Host ("  {0,-36} {1}" -f $_, $val)
}

Write-Host ''
Write-Host 'Security notifications enabled:'
Write-Host "  password_changed: $($response.mailer_notifications_password_changed_enabled)"
Write-Host "  email_changed:    $($response.mailer_notifications_email_changed_enabled)"
Write-Host "  phone_changed:    $($response.mailer_notifications_phone_changed_enabled)"
Write-Host "  mfa enrolled:     $($response.mailer_notifications_mfa_factor_enrolled_enabled)"
Write-Host "  mfa unenrolled:   $($response.mailer_notifications_mfa_factor_unenrolled_enabled)"
Write-Host "  identity linked:  $($response.mailer_notifications_identity_linked_enabled)"
Write-Host "  identity unlinked:$($response.mailer_notifications_identity_unlinked_enabled)"
