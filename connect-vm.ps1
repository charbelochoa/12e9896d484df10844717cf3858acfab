param(
    [string]$VmAddress,
    [string]$SshUser,
    [string]$KeyPath,
    [ValidateRange(1,65535)][int]$CampusPort = 18088,
    [ValidateRange(1,65535)][int]$StrictPort = 18090,
    [string]$SshConfig,
    [string]$SshAlias = 'educatia-lab'
)
$ErrorActionPreference = 'Stop'
if ($CampusPort -eq $StrictPort) {
    throw 'Elige dos puertos locales diferentes.'
}
$taskSshArgs = @()
if ($VmAddress -or $SshUser -or $KeyPath) {
    if (-not ($VmAddress -and $SshUser -and $KeyPath)) {
        throw 'Indica juntos -VmAddress, -SshUser y -KeyPath, o usa la configuración local sin esos parámetros.'
    }
    $taskResolvedKey = (Resolve-Path -LiteralPath $KeyPath).Path
    $taskSshArgs += @('-i', $taskResolvedKey, '-o', 'IdentitiesOnly=yes')
    $taskTarget = "$SshUser@$VmAddress"
} else {
    if (-not $SshConfig) { $SshConfig = Join-Path $PSScriptRoot '.local\ssh-config' }
    if (-not (Test-Path -LiteralPath $SshConfig -PathType Leaf)) {
        throw 'No hay configuración SSH local. Usa -VmAddress, -SshUser y -KeyPath con los datos de tu servidor.'
    }
    $taskSshArgs += @('-F', (Resolve-Path -LiteralPath $SshConfig).Path)
    $taskTarget = $SshAlias
}
$taskSshArgs += @('-o', 'ExitOnForwardFailure=yes', '-o', 'ConnectTimeout=10',
    '-o', 'ServerAliveInterval=30', '-o', 'ServerAliveCountMax=3', '-N',
    '-L', "127.0.0.1:${CampusPort}:127.0.0.1:8088",
    '-L', "127.0.0.1:${StrictPort}:127.0.0.1:8090", $taskTarget)
Write-Output "Cuando SSH conecte: campus principal http://127.0.0.1:$CampusPort"
Write-Output "Cuando SSH conecte: campus modo estricto http://127.0.0.1:$StrictPort"
Write-Output 'Mantén esta terminal abierta. Ctrl+C cierra este túnel.'
& ssh @taskSshArgs
if ($LASTEXITCODE -ne 0) { throw "SSH terminó con código $LASTEXITCODE. Revisa el mensaje anterior." }
