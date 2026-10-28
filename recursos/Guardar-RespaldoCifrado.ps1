$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Security
$rootBackup = 'C:\Users\Informatica\AppData\Local\Packages\OpenAI.Codex_2p2nqsd0c76g0\LocalCache\Local\CodexBackups\Videoteca\2026-09-12_R2_verificado'
[IO.Directory]::CreateDirectory($rootBackup) | Out-Null
$itemsBackup = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String([Console]::In.ReadToEnd())) | ConvertFrom-Json
$recordsBackup = @()
foreach ($entryBackup in $itemsBackup.PSObject.Properties) {
  if ($entryBackup.Name -notmatch '^[A-Za-z0-9_.-]+$') { throw 'Nombre inválido' }
  $destBackup = Join-Path $rootBackup ($entryBackup.Name + '.dpapi')
  if (Test-Path -LiteralPath $destBackup) { throw 'El respaldo ya existe' }
  $rawBackup = [Text.Encoding]::UTF8.GetBytes([string]$entryBackup.Value)
  $encBackup = [Security.Cryptography.ProtectedData]::Protect($rawBackup,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)
  [IO.File]::WriteAllText($destBackup,[Convert]::ToBase64String($encBackup))
  $savedBackup = [Convert]::FromBase64String([IO.File]::ReadAllText($destBackup))
  $checkBackup = [Security.Cryptography.ProtectedData]::Unprotect($savedBackup,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)
  if ([Convert]::ToBase64String($checkBackup) -cne [Convert]::ToBase64String($rawBackup)) { throw 'Recuperación incorrecta' }
  $hashBackup = [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($checkBackup)).Replace('-','').ToLowerInvariant()
  $recordsBackup += @{archivo=$entryBackup.Name;bytes=$rawBackup.Length;sha256=$hashBackup;recuperado=$true}
  [Array]::Clear($rawBackup,0,$rawBackup.Length)
  [Array]::Clear($checkBackup,0,$checkBackup.Length)
}
$reportBackup = @{carpeta=$rootBackup;archivos=$recordsBackup}
$reportBackup | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $rootBackup 'VERIFICACION.json') -Encoding UTF8
$reportBackup | ConvertTo-Json -Depth 5
