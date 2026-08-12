Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-AlfiEnv {
    param(
        [Parameter(Mandatory = $true)]
        [string]$EnvFile
    )

    if (-not (Test-Path -LiteralPath $EnvFile)) {
        throw "No se encontró el archivo de entorno: $EnvFile"
    }

    $values = @{}

    foreach ($line in Get-Content -LiteralPath $EnvFile) {
        $trimmed = $line.Trim()

        if (-not $trimmed -or $trimmed.StartsWith('#')) {
            continue
        }

        $separator = $trimmed.IndexOf('=')

        if ($separator -lt 1) {
            continue
        }

        $key = $trimmed.Substring(0, $separator).Trim()
        $value = $trimmed.Substring($separator + 1).Trim()

        if (
            ($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))
        ) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        $values[$key] = $value
    }

    foreach ($required in @('DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD')) {
        if (-not $values.ContainsKey($required) -or -not $values[$required]) {
            throw "Falta la variable requerida $required en $EnvFile"
        }
    }

    return $values
}

function Get-PostgreSqlTool {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ToolName
    )

    $command = Get-Command $ToolName -ErrorAction SilentlyContinue

    if ($command) {
        return $command.Source
    }

    $postgresRoot = 'C:\Program Files\PostgreSQL'

    if (Test-Path -LiteralPath $postgresRoot) {
        $candidate = Get-ChildItem -LiteralPath $postgresRoot -Directory |
            Sort-Object {
                try {
                    [version]$_.Name
                } catch {
                    [version]'0.0'
                }
            } -Descending |
            ForEach-Object {
                Join-Path $_.FullName "bin\$ToolName.exe"
            } |
            Where-Object {
                Test-Path -LiteralPath $_
            } |
            Select-Object -First 1

        if ($candidate) {
            return $candidate
        }
    }

    throw "No se encontró $ToolName. Instala PostgreSQL client tools o agrega su carpeta bin al PATH."
}

function Invoke-WithPgPassword {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Password,

        [Parameter(Mandatory = $true)]
        [scriptblock]$Action
    )

    $previousPassword = $env:PGPASSWORD

    try {
        $env:PGPASSWORD = $Password
        & $Action
    } finally {
        if ($null -eq $previousPassword) {
            Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
        } else {
            $env:PGPASSWORD = $previousPassword
        }
    }
}

function Invoke-PostgresTool {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Executable,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [Parameter(Mandatory = $true)]
        [string]$Password
    )

    Invoke-WithPgPassword -Password $Password -Action {
        & $Executable @Arguments

        if ($LASTEXITCODE -ne 0) {
            throw "$([System.IO.Path]::GetFileName($Executable)) terminó con código $LASTEXITCODE."
        }
    }
}
