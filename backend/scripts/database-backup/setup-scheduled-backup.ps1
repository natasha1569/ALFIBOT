[CmdletBinding()]
param(
    [string]$TaskName = 'ALFIBOT PostgreSQL Backup',
    [string]$DailyAt = '02:00'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$backupScript = Join-Path $PSScriptRoot 'backup.ps1'

if (-not (Test-Path -LiteralPath $backupScript)) {
    throw "No se encontró backup.ps1 en $PSScriptRoot"
}

try {
    $time = [datetime]::ParseExact(
        $DailyAt,
        'HH:mm',
        [System.Globalization.CultureInfo]::InvariantCulture
    )
} catch {
    throw 'DailyAt debe tener formato HH:mm, por ejemplo 02:00.'
}

$action = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$backupScript`""

$trigger = New-ScheduledTaskTrigger `
    -Daily `
    -At $time

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2)

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description 'AFB-189 - Respaldo diario automatizado de PostgreSQL para ALFI BOT.' `
    -Force | Out-Null

Write-Host 'AFB-189 SCHEDULE OK'
Write-Host "Tarea: $TaskName"
Write-Host "Frecuencia: diaria a las $DailyAt"
Write-Host 'Si el equipo estaba apagado, Windows intentará ejecutar la tarea al volver a estar disponible.'
