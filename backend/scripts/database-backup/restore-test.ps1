[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,

    [string]$EnvFile,

    [string]$TargetDatabase = 'alfi_bot_restore_test'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'common.ps1')

if (-not $EnvFile) {
    $EnvFile = [System.IO.Path]::GetFullPath(
        (Join-Path $PSScriptRoot '..\..\.env')
    )
}

if (-not (Test-Path -LiteralPath $BackupFile)) {
    throw "No existe el backup: $BackupFile"
}

if ($TargetDatabase -notmatch '_restore_test$') {
    throw 'Por seguridad, TargetDatabase debe terminar exactamente en _restore_test.'
}

$database = Get-AlfiEnv -EnvFile $EnvFile

if ($TargetDatabase -eq $database.DB_NAME) {
    throw 'La base de restauración no puede ser la misma base configurada en DB_NAME.'
}

$psql = Get-PostgreSqlTool -ToolName 'psql'
$createdb = Get-PostgreSqlTool -ToolName 'createdb'
$dropdb = Get-PostgreSqlTool -ToolName 'dropdb'
$pgRestore = Get-PostgreSqlTool -ToolName 'pg_restore'

Write-Host "AFB-189 | Restauración controlada en: $TargetDatabase"
Write-Host 'La base productiva/configurada NO será eliminada ni modificada.'

# Cierra conexiones solo contra la base de prueba para permitir recrearla.
$terminateSql = @"
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$TargetDatabase'
  AND pid <> pg_backend_pid();
"@

Invoke-PostgresTool `
    -Executable $psql `
    -Password $database.DB_PASSWORD `
    -Arguments @(
        '--host', $database.DB_HOST,
        '--port', $database.DB_PORT,
        '--username', $database.DB_USER,
        '--dbname', 'postgres',
        '--command', $terminateSql
    )

Invoke-WithPgPassword -Password $database.DB_PASSWORD -Action {
    & $dropdb `
        --host $database.DB_HOST `
        --port $database.DB_PORT `
        --username $database.DB_USER `
        --if-exists `
        $TargetDatabase

    if ($LASTEXITCODE -ne 0) {
        throw "dropdb terminó con código $LASTEXITCODE."
    }
}

Invoke-PostgresTool `
    -Executable $createdb `
    -Password $database.DB_PASSWORD `
    -Arguments @(
        '--host', $database.DB_HOST,
        '--port', $database.DB_PORT,
        '--username', $database.DB_USER,
        $TargetDatabase
    )

Invoke-PostgresTool `
    -Executable $pgRestore `
    -Password $database.DB_PASSWORD `
    -Arguments @(
        '--host', $database.DB_HOST,
        '--port', $database.DB_PORT,
        '--username', $database.DB_USER,
        '--dbname', $TargetDatabase,
        '--no-owner',
        '--no-privileges',
        '--exit-on-error',
        $BackupFile
    )

function Get-Metric {
    param(
        [string]$DatabaseName,
        [string]$Sql
    )

    $output = Invoke-WithPgPassword -Password $database.DB_PASSWORD -Action {
        & $psql `
            --host $database.DB_HOST `
            --port $database.DB_PORT `
            --username $database.DB_USER `
            --dbname $DatabaseName `
            --tuples-only `
            --no-align `
            --command $Sql

        if ($LASTEXITCODE -ne 0) {
            throw "psql terminó con código $LASTEXITCODE al validar $DatabaseName."
        }
    }

    $metricValue = $output |
        Where-Object {
            -not [string]::IsNullOrWhiteSpace($_)
        } |
        Select-Object -Last 1

    if ($null -eq $metricValue) {
        throw "No se obtuvo una métrica válida desde la base $DatabaseName."
    }

    return [int]$metricValue
}

$metrics = @(
    @{
        Name = 'tablas alfi'
        Sql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'alfi' AND table_type = 'BASE TABLE';"
    },
    @{
        Name = 'vistas alfi'
        Sql = "SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'alfi';"
    },
    @{
        Name = 'restricciones alfi'
        Sql = "SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = 'alfi';"
    }
)

$results = foreach ($metric in $metrics) {
    $sourceValue = Get-Metric -DatabaseName $database.DB_NAME -Sql $metric.Sql
    $targetValue = Get-Metric -DatabaseName $TargetDatabase -Sql $metric.Sql

    [pscustomobject]@{
        Metrica = $metric.Name
        Origen = $sourceValue
        Restaurada = $targetValue
        Coincide = ($sourceValue -eq $targetValue)
    }
}

$results | Format-Table -AutoSize

if ($results.Coincide -contains $false) {
    throw 'La restauración terminó, pero una o más métricas estructurales no coinciden.'
}

Write-Host ''
Write-Host 'AFB-189 RESTORE TEST OK'
Write-Host "Origen: $($database.DB_NAME)"
Write-Host "Restaurada: $TargetDatabase"
Write-Host "Backup: $BackupFile"