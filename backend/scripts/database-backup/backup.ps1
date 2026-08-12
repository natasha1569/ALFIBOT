[CmdletBinding()]
param(
    [string]$EnvFile,
    [string]$BackupDir = (Join-Path $env:LOCALAPPDATA 'ALFIBOT\backups'),
    [ValidateRange(1, 3650)]
    [int]$RetentionDays = 14
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'common.ps1')

if (-not $EnvFile) {
    $EnvFile = [System.IO.Path]::GetFullPath(
        (Join-Path $PSScriptRoot '..\..\.env')
    )
}

$database = Get-AlfiEnv -EnvFile $EnvFile
$pgDump = Get-PostgreSqlTool -ToolName 'pg_dump'
$pgRestore = Get-PostgreSqlTool -ToolName 'pg_restore'

New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$safeDatabaseName = $database.DB_NAME -replace '[^A-Za-z0-9_-]', '_'
$backupFile = Join-Path $BackupDir "${safeDatabaseName}_${timestamp}.dump"

Write-Host "AFB-189 | Generando respaldo PostgreSQL..."
Write-Host "Base: $($database.DB_NAME)"
Write-Host "Destino: $backupFile"

Invoke-PostgresTool `
    -Executable $pgDump `
    -Password $database.DB_PASSWORD `
    -Arguments @(
        '--host', $database.DB_HOST,
        '--port', $database.DB_PORT,
        '--username', $database.DB_USER,
        '--dbname', $database.DB_NAME,
        '--format=custom',
        '--compress=6',
        '--no-owner',
        '--no-privileges',
        '--file', $backupFile
    )

if (-not (Test-Path -LiteralPath $backupFile)) {
    throw 'pg_dump finalizó sin crear el archivo de respaldo.'
}

$backupInfo = Get-Item -LiteralPath $backupFile

if ($backupInfo.Length -le 0) {
    throw 'El archivo de respaldo fue creado con tamaño 0.'
}

# Una lectura del catálogo con pg_restore detecta dumps corruptos o no reconocibles.
Invoke-PostgresTool `
    -Executable $pgRestore `
    -Password $database.DB_PASSWORD `
    -Arguments @('--list', $backupFile)

$cutoff = (Get-Date).AddDays(-$RetentionDays)

Get-ChildItem -LiteralPath $BackupDir -Filter '*.dump' -File |
    Where-Object {
        $_.LastWriteTime -lt $cutoff
    } |
    Remove-Item -Force

Write-Host ''
Write-Host 'AFB-189 BACKUP OK'
Write-Host "Archivo: $backupFile"
Write-Host "Tamaño: $($backupInfo.Length) bytes"
Write-Host "Retención: $RetentionDays días"
