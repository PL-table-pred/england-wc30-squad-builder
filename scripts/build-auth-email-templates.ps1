# Builds all LionXI-branded Supabase Auth email HTML files under supabase/templates/
# Run: powershell -ExecutionPolicy Bypass -File scripts/build-auth-email-templates.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'supabase/templates'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$brandLogo = @'
<td width="40" height="40" align="center" valign="middle" style="background-color:#ce1124;border-radius:8px;padding:7px;">
  <table role="presentation" width="26" height="26" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;">
    <tr>
      <td width="11" height="11" style="background-color:#ffffff;font-size:0;line-height:0;">&nbsp;</td>
      <td width="4" height="11" style="background-color:#ce1124;font-size:0;line-height:0;">&nbsp;</td>
      <td width="11" height="11" style="background-color:#ffffff;font-size:0;line-height:0;">&nbsp;</td>
    </tr>
    <tr>
      <td width="11" height="4" style="background-color:#ce1124;font-size:0;line-height:0;">&nbsp;</td>
      <td width="4" height="4" style="background-color:#ce1124;font-size:0;line-height:0;">&nbsp;</td>
      <td width="11" height="4" style="background-color:#ce1124;font-size:0;line-height:0;">&nbsp;</td>
    </tr>
    <tr>
      <td width="11" height="11" style="background-color:#ffffff;font-size:0;line-height:0;">&nbsp;</td>
      <td width="4" height="11" style="background-color:#ce1124;font-size:0;line-height:0;">&nbsp;</td>
      <td width="11" height="11" style="background-color:#ffffff;font-size:0;line-height:0;">&nbsp;</td>
    </tr>
  </table>
</td>
'@

function New-LionXiEmailHtml {
  param(
    [Parameter(Mandatory)] [string] $DocumentTitle,
    [Parameter(Mandatory)] [string] $Eyebrow,
    [Parameter(Mandatory)] [string] $Heading,
    [Parameter(Mandatory)] [string] $BodyHtml,
    [string] $CtaLabel = '',
    [string] $CtaUrl = '',
    [string] $FooterNote = '',
    [string] $TokenBlock = ''
  )

  $ctaBlock = ''
  if ($CtaLabel -and $CtaUrl) {
    $ctaBlock = @"
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
                  <tr>
                    <td align="center" style="background-color:#ce1124;border-radius:10px;">
                      <a href="$CtaUrl" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;line-height:1;color:#ffffff;text-decoration:none;">
                        $CtaLabel
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px 0;font-size:12px;line-height:1.5;color:#94a3b8;">
                  Button not working? Paste this link into your browser:
                </p>
                <p style="margin:0;font-size:12px;line-height:1.5;word-break:break-all;">
                  <a href="$CtaUrl" style="color:#ce1124;text-decoration:underline;">$CtaUrl</a>
                </p>
"@
  }

  $footerNoteHtml = ''
  if ($FooterNote) {
    $footerNoteHtml = @"
                <p style="margin:0 0 8px 0;font-size:12px;line-height:1.5;color:#94a3b8;">
                  $FooterNote
                </p>
"@
  }

  return @"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>$DocumentTitle</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8f9fb;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a2a4a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f9fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
            <tr>
              <td style="padding:0 0 20px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    $brandLogo
                    <td style="padding-left:12px;">
                      <div style="font-size:18px;font-weight:700;line-height:1.2;color:#1a2a4a;">England WC &#39;30</div>
                      <div style="font-size:12px;line-height:1.3;color:#64748b;">Squad Builder &#183; LionXI</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px 28px;">
                <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#ce1124;">
                  $Eyebrow
                </p>
                <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.25;font-weight:700;color:#1a2a4a;">
                  $Heading
                </h1>
$BodyHtml
$TokenBlock
$ctaBlock
              </td>
            </tr>

            <tr>
              <td style="padding:24px 8px 0 8px;text-align:center;">
$footerNoteHtml
                <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                  Independent fan project &#183; not affiliated with The FA or FIFA<br />
                  <a href="https://lionxi.co" style="color:#ce1124;text-decoration:none;font-weight:600;">lionxi.co</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"@
}

function Write-Template([string]$Name, [string]$Html) {
  $path = Join-Path $outDir "$Name.html"
  # Normalize newlines for email clients / API
  $normalized = ($Html -replace "`r`n", "`n").Trim() + "`n"
  [System.IO.File]::WriteAllText($path, $normalized, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Wrote $Name.html"
}

$greeting = @'
                {{ if .Data.display_name }}
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#1a2a4a;">
                  Hi {{ .Data.display_name }},
                </p>
                {{ end }}
'@

# --- Auth action emails ---

Write-Template 'confirmation' (New-LionXiEmailHtml `
  -DocumentTitle 'Confirm your email' `
  -Eyebrow 'Welcome' `
  -Heading 'Confirm your email' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  Thanks for joining <strong style="color:#1a2a4a;">England WC &#39;30 Squad Builder</strong>. Confirm your email to save squads, submit predictions, and climb the community leaderboard.
                </p>
                <p style="margin:0 0 28px 0;font-size:14px;line-height:1.5;color:#64748b;">
                  This link is for <strong style="color:#1a2a4a;">{{ .Email }}</strong>.
                </p>
"@ `
  -CtaLabel 'Confirm email' `
  -CtaUrl '{{ .ConfirmationURL }}' `
  -FooterNote 'If you didn&#39;t create an account, you can ignore this email.')

Write-Template 'recovery' (New-LionXiEmailHtml `
  -DocumentTitle 'Reset your password' `
  -Eyebrow 'Account security' `
  -Heading 'Reset your password' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  We received a request to reset the password for your LionXI account
                  (<strong style="color:#1a2a4a;">{{ .Email }}</strong>).
                </p>
                <p style="margin:0 0 28px 0;font-size:15px;line-height:1.55;color:#475569;">
                  Choose a new password to get back to building your England WC &#39;30 squad.
                </p>
"@ `
  -CtaLabel 'Choose new password' `
  -CtaUrl '{{ .ConfirmationURL }}' `
  -FooterNote 'If you didn&#39;t ask to reset your password, you can ignore this email — your account stays secure.')

Write-Template 'magic_link' (New-LionXiEmailHtml `
  -DocumentTitle 'Your sign-in link' `
  -Eyebrow 'Sign in' `
  -Heading 'Your sign-in link' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  Use the button below to sign in to LionXI
                  (<strong style="color:#1a2a4a;">{{ .Email }}</strong>).
                </p>
                <p style="margin:0 0 28px 0;font-size:14px;line-height:1.5;color:#64748b;">
                  This link expires shortly and can only be used once.
                </p>
"@ `
  -CtaLabel 'Sign in to LionXI' `
  -CtaUrl '{{ .ConfirmationURL }}' `
  -FooterNote 'If you didn&#39;t request this link, you can ignore this email.')

Write-Template 'invite' (New-LionXiEmailHtml `
  -DocumentTitle 'You''ve been invited' `
  -Eyebrow 'Invitation' `
  -Heading 'You&#39;ve been invited' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  You&#39;ve been invited to create a LionXI account and build your England WC &#39;30 squad prediction.
                </p>
                <p style="margin:0 0 28px 0;font-size:14px;line-height:1.5;color:#64748b;">
                  Accept the invitation for <strong style="color:#1a2a4a;">{{ .Email }}</strong> to get started.
                </p>
"@ `
  -CtaLabel 'Accept invitation' `
  -CtaUrl '{{ .ConfirmationURL }}' `
  -FooterNote 'If you weren&#39;t expecting this invite, you can ignore this email.')

Write-Template 'email_change' (New-LionXiEmailHtml `
  -DocumentTitle 'Confirm your new email' `
  -Eyebrow 'Account security' `
  -Heading 'Confirm your new email' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  Confirm <strong style="color:#1a2a4a;">{{ .NewEmail }}</strong> as the new email address for your LionXI account.
                </p>
                <p style="margin:0 0 28px 0;font-size:14px;line-height:1.5;color:#64748b;">
                  Until you confirm, your account stays on the current address.
                </p>
"@ `
  -CtaLabel 'Confirm new email' `
  -CtaUrl '{{ .ConfirmationURL }}' `
  -FooterNote 'If you didn&#39;t request this change, you can ignore this email.')

$tokenBlock = @'
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;">
                  <tr>
                    <td align="center" style="background-color:#f8f9fb;border:1px solid #e2e8f0;border-radius:12px;padding:20px 16px;">
                      <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">
                        Verification code
                      </p>
                      <p style="margin:0;font-size:32px;font-weight:800;letter-spacing:0.18em;line-height:1.2;color:#1a2a4a;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">
                        {{ .Token }}
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:14px;line-height:1.5;color:#64748b;">
                  Enter this code in LionXI to continue. It expires shortly.
                </p>
'@

Write-Template 'reauthentication' (New-LionXiEmailHtml `
  -DocumentTitle 'Your verification code' `
  -Eyebrow 'Account security' `
  -Heading 'Your verification code' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  Use this code to verify it&#39;s you before continuing a sensitive change on your LionXI account
                  (<strong style="color:#1a2a4a;">{{ .Email }}</strong>).
                </p>
"@ `
  -TokenBlock $tokenBlock `
  -FooterNote 'If you didn&#39;t start this action, you can ignore this email.')

# --- Security notifications (no action link) ---

$securityCta = @'
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0 0;">
                  <tr>
                    <td align="center" style="background-color:#1a2a4a;border-radius:10px;">
                      <a href="https://lionxi.co/login" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;line-height:1;color:#ffffff;text-decoration:none;">
                        Open LionXI
                      </a>
                    </td>
                  </tr>
                </table>
'@

Write-Template 'password_changed_notification' (New-LionXiEmailHtml `
  -DocumentTitle 'Your password was changed' `
  -Eyebrow 'Security alert' `
  -Heading 'Your password was changed' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  The password for your LionXI account
                  (<strong style="color:#1a2a4a;">{{ .Email }}</strong>) was recently changed.
                </p>
                <p style="margin:0 0 28px 0;font-size:15px;line-height:1.55;color:#475569;">
                  If you made this change, you&#39;re all set. If not, reset your password and contact us right away.
                </p>
$securityCta
"@ `
  -FooterNote 'Need help? Visit <a href="https://lionxi.co/contact" style="color:#ce1124;text-decoration:none;font-weight:600;">lionxi.co/contact</a>.')

Write-Template 'email_changed_notification' (New-LionXiEmailHtml `
  -DocumentTitle 'Your email address was changed' `
  -Eyebrow 'Security alert' `
  -Heading 'Your email address was changed' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  The email for your LionXI account changed from
                  <strong style="color:#1a2a4a;">{{ .OldEmail }}</strong> to
                  <strong style="color:#1a2a4a;">{{ .Email }}</strong>.
                </p>
                <p style="margin:0 0 28px 0;font-size:15px;line-height:1.55;color:#475569;">
                  If you made this change, you&#39;re all set. If not, contact us right away.
                </p>
$securityCta
"@ `
  -FooterNote 'Need help? Visit <a href="https://lionxi.co/contact" style="color:#ce1124;text-decoration:none;font-weight:600;">lionxi.co/contact</a>.')

Write-Template 'phone_changed_notification' (New-LionXiEmailHtml `
  -DocumentTitle 'Your phone number was changed' `
  -Eyebrow 'Security alert' `
  -Heading 'Your phone number was changed' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  The phone number for your LionXI account changed from
                  <strong style="color:#1a2a4a;">{{ .OldPhone }}</strong> to
                  <strong style="color:#1a2a4a;">{{ .Phone }}</strong>.
                </p>
                <p style="margin:0 0 28px 0;font-size:15px;line-height:1.55;color:#475569;">
                  If you made this change, you&#39;re all set. If not, contact us right away.
                </p>
$securityCta
"@ `
  -FooterNote 'Need help? Visit <a href="https://lionxi.co/contact" style="color:#ce1124;text-decoration:none;font-weight:600;">lionxi.co/contact</a>.')

Write-Template 'mfa_factor_enrolled_notification' (New-LionXiEmailHtml `
  -DocumentTitle 'A verification method was added' `
  -Eyebrow 'Security alert' `
  -Heading 'A verification method was added' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  Sign-in verification method <strong style="color:#1a2a4a;">{{ .FactorType }}</strong> was added to your LionXI account
                  (<strong style="color:#1a2a4a;">{{ .Email }}</strong>).
                </p>
                <p style="margin:0 0 28px 0;font-size:15px;line-height:1.55;color:#475569;">
                  If you made this change, you&#39;re all set. If not, contact us right away.
                </p>
$securityCta
"@ `
  -FooterNote 'Need help? Visit <a href="https://lionxi.co/contact" style="color:#ce1124;text-decoration:none;font-weight:600;">lionxi.co/contact</a>.')

Write-Template 'mfa_factor_unenrolled_notification' (New-LionXiEmailHtml `
  -DocumentTitle 'A verification method was removed' `
  -Eyebrow 'Security alert' `
  -Heading 'A verification method was removed' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  Sign-in verification method <strong style="color:#1a2a4a;">{{ .FactorType }}</strong> was removed from your LionXI account
                  (<strong style="color:#1a2a4a;">{{ .Email }}</strong>).
                </p>
                <p style="margin:0 0 28px 0;font-size:15px;line-height:1.55;color:#475569;">
                  If you made this change, you&#39;re all set. If not, contact us right away.
                </p>
$securityCta
"@ `
  -FooterNote 'Need help? Visit <a href="https://lionxi.co/contact" style="color:#ce1124;text-decoration:none;font-weight:600;">lionxi.co/contact</a>.')

Write-Template 'identity_linked_notification' (New-LionXiEmailHtml `
  -DocumentTitle 'A sign-in method was linked' `
  -Eyebrow 'Security alert' `
  -Heading 'A sign-in method was linked' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  Your <strong style="color:#1a2a4a;">{{ .Provider }}</strong> account was linked as a sign-in method for
                  <strong style="color:#1a2a4a;">{{ .Email }}</strong>.
                </p>
                <p style="margin:0 0 28px 0;font-size:15px;line-height:1.55;color:#475569;">
                  If you made this change, you&#39;re all set. If not, contact us right away.
                </p>
$securityCta
"@ `
  -FooterNote 'Need help? Visit <a href="https://lionxi.co/contact" style="color:#ce1124;text-decoration:none;font-weight:600;">lionxi.co/contact</a>.')

Write-Template 'identity_unlinked_notification' (New-LionXiEmailHtml `
  -DocumentTitle 'A sign-in method was removed' `
  -Eyebrow 'Security alert' `
  -Heading 'A sign-in method was removed' `
  -BodyHtml @"
$greeting
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#475569;">
                  Your <strong style="color:#1a2a4a;">{{ .Provider }}</strong> account was removed as a sign-in method for
                  <strong style="color:#1a2a4a;">{{ .Email }}</strong>.
                </p>
                <p style="margin:0 0 28px 0;font-size:15px;line-height:1.55;color:#475569;">
                  If you made this change, you&#39;re all set. If not, contact us right away.
                </p>
$securityCta
"@ `
  -FooterNote 'Need help? Visit <a href="https://lionxi.co/contact" style="color:#ce1124;text-decoration:none;font-weight:600;">lionxi.co/contact</a>.')

Write-Host 'All auth email templates built.'
