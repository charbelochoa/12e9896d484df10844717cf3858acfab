param([switch]$Strict)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if ($Strict) {
    python -m app.server --port 8090 --internal-port 8092 --data data/strict --hardened
} else {
    python -m app.server --port 8088 --internal-port 8099 --data data/secure
}
