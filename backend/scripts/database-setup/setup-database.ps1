param(
    [string]$DatabaseName,
    [string]$EnvFile,
    [string]$SqlFile,
    [string]$MaintenanceDatabase = 'postgres'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptDirectory '..\..\..')).Path

if (-not $EnvFile) {
    $EnvFile = Join-Path $repoRoot 'backend\.env'
}

if (-not $SqlFile) {
    $SqlFile = Join-Path $repoRoot 'backend\sql\ALFI_BOT_DATABASE.sql'
}

function Get-AlfiEnv {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "No se encontro el archivo de entorno: $Path"
    }

    $values = @{}

    foreach ($line in Get-Content -LiteralPath $Path) {
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
            throw "Falta la variable requerida $required en $Path"
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
            ForEach-Object {
                $versionNumber = 0
                [void][int]::TryParse($_.Name, [ref]$versionNumber)

                [pscustomobject]@{
                    VersionNumber = $versionNumber
                    Path = Join-Path $_.FullName "bin\$ToolName.exe"
                }
            } |
            Where-Object {
                Test-Path -LiteralPath $_.Path
            } |
            Sort-Object VersionNumber -Descending |
            Select-Object -First 1

        if ($candidate) {
            return $candidate.Path
        }
    }

    throw "No se encontro $ToolName. Instala PostgreSQL client tools o agrega su carpeta bin al PATH."
}

function Invoke-WithPgPassword {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Password,

        [Parameter(Mandatory = $true)]
        [scriptblock]$Action
    )

    $previousPassword = $env:PGPASSWORD
    $previousEncoding = $env:PGCLIENTENCODING

    try {
        $env:PGPASSWORD = $Password
        $env:PGCLIENTENCODING = 'UTF8'
        & $Action
    }
    finally {
        if ($null -eq $previousPassword) {
            Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
        }
        else {
            $env:PGPASSWORD = $previousPassword
        }

        if ($null -eq $previousEncoding) {
            Remove-Item Env:PGCLIENTENCODING -ErrorAction SilentlyContinue
        }
        else {
            $env:PGCLIENTENCODING = $previousEncoding
        }
    }
}

function Invoke-Psql {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Database,

        [Parameter(Mandatory = $true)]
        [string[]]$AdditionalArguments
    )

    $toolArguments = @(
        '-X',
        '-v', 'ON_ERROR_STOP=1',
        '-h', $config.DB_HOST,
        '-p', $config.DB_PORT,
        '-U', $config.DB_USER,
        '-d', $Database
    ) + $AdditionalArguments

    Invoke-WithPgPassword -Password $config.DB_PASSWORD -Action {
        & $psql @toolArguments

        if ($LASTEXITCODE -ne 0) {
            throw "psql termino con codigo $LASTEXITCODE."
        }
    }
}

function Test-DatabaseExists {
    $escapedDatabaseName = $DatabaseName.Replace("'", "''")
    $query = "SELECT 1 FROM pg_database WHERE datname = '$escapedDatabaseName';"

    $result = Invoke-WithPgPassword -Password $config.DB_PASSWORD -Action {
        $toolArguments = @(
            '-X',
            '-v', 'ON_ERROR_STOP=1',
            '-h', $config.DB_HOST,
            '-p', $config.DB_PORT,
            '-U', $config.DB_USER,
            '-d', $MaintenanceDatabase,
            '-A',
            '-t',
            '-c', $query
        )

        $output = & $psql @toolArguments

        if ($LASTEXITCODE -ne 0) {
            throw "No se pudo consultar el catalogo de bases de datos."
        }

        return $output
    }

    return (@($result | ForEach-Object { "$_".Trim() } | Where-Object { $_ }) -contains '1')
}

function New-Database {
    $toolArguments = @(
        '-h', $config.DB_HOST,
        '-p', $config.DB_PORT,
        '-U', $config.DB_USER,
        $DatabaseName
    )

    Invoke-WithPgPassword -Password $config.DB_PASSWORD -Action {
        & $createdb @toolArguments

        if ($LASTEXITCODE -ne 0) {
            throw "No se pudo crear la base de datos $DatabaseName."
        }
    }
}

function Assert-CanonicalInstallation {
    $validationSql = @"
DO `$`$
BEGIN
    IF (
        SELECT count(*)
        FROM information_schema.tables
        WHERE table_schema = 'alfi'
          AND table_type = 'BASE TABLE'
    ) <> 8 THEN
        RAISE EXCEPTION 'Cantidad de tablas ALFI inesperada.';
    END IF;

    IF (
        SELECT count(*)
        FROM information_schema.views
        WHERE table_schema = 'alfi'
    ) <> 4 THEN
        RAISE EXCEPTION 'Cantidad de vistas ALFI inesperada.';
    END IF;

    IF (
        SELECT count(*)
        FROM alfi.roles
        WHERE nombre IN ('administrador', 'auditor', 'usuario')
    ) <> 3 THEN
        RAISE EXCEPTION 'Catalogo de roles funcionales incompleto.';
    END IF;

    IF (
        SELECT count(*)
        FROM pg_roles
        WHERE rolname IN ('rol_alfi_admin', 'rol_alfi_auditor', 'rol_alfi_usuario')
          AND rolcanlogin = false
          AND rolsuper = false
    ) <> 3 THEN
        RAISE EXCEPTION 'Roles PostgreSQL RBAC incompletos o inseguros.';
    END IF;
END
`$`$;
"@

    Invoke-Psql -Database $DatabaseName -AdditionalArguments @('-c', $validationSql)
}

$config = Get-AlfiEnv -Path $EnvFile

if (-not $DatabaseName) {
    $DatabaseName = $config.DB_NAME
}

if (-not $DatabaseName -or $DatabaseName -notmatch '^[A-Za-z0-9_-]+$') {
    throw 'DatabaseName contiene caracteres no permitidos.'
}

if (-not (Test-Path -LiteralPath $SqlFile)) {
    throw "No se encontro el SQL canonico: $SqlFile"
}

$psql = Get-PostgreSqlTool -ToolName 'psql'
$createdb = Get-PostgreSqlTool -ToolName 'createdb'

Write-Host ''
Write-Host '=== ALFI BOT DATABASE SETUP ==='
Write-Host "Servidor: $($config.DB_HOST):$($config.DB_PORT)"
Write-Host "Usuario PostgreSQL: $($config.DB_USER)"
Write-Host "Base objetivo: $DatabaseName"
Write-Host "SQL canonico: $SqlFile"
Write-Host ''

Write-Host '[1/4] Comprobando conexion PostgreSQL...'
Invoke-Psql -Database $MaintenanceDatabase -AdditionalArguments @('-c', 'SELECT 1;') | Out-Null

if (Test-DatabaseExists) {
    Write-Host "[2/4] La base $DatabaseName ya existe. Se conservaran sus datos."
}
else {
    Write-Host "[2/4] Creando base $DatabaseName..."
    New-Database
}

Write-Host '[3/4] Ejecutando ALFI_BOT_DATABASE.sql...'
Invoke-Psql -Database $DatabaseName -AdditionalArguments @('-f', $SqlFile)

Write-Host '[4/4] Validando instalacion canonica...'
Assert-CanonicalInstallation

Write-Host ''
Write-Host 'ALFI BOT DATABASE SETUP OK'
Write-Host "Base lista: $DatabaseName"
