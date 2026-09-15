param(
    [Parameter(Mandatory = $true)]
    [string]$ServerUrl,

    [Parameter(Mandatory = $true)]
    [string]$Token
)

$ErrorActionPreference = 'Stop'
$ServerUrl = $ServerUrl.TrimEnd('/')

Write-Host "Checking JoshMemory central service at $ServerUrl ..."
$health = Invoke-RestMethod -Uri "$ServerUrl/health" -Method Get -TimeoutSec 5
if (-not $health.ok) {
    throw "JoshMemory central health check failed."
}

[Environment]::SetEnvironmentVariable('JOSHMEMORY_REMOTE_URL', $ServerUrl, 'User')
[Environment]::SetEnvironmentVariable('JOSHMEMORY_TOKEN', $Token, 'User')

$env:JOSHMEMORY_REMOTE_URL = $ServerUrl
$env:JOSHMEMORY_TOKEN = $Token

Write-Host "JoshMemory central client configured for this shell and future user processes."
Write-Host "Remote URL: $ServerUrl"
Write-Host "Restart Antigravity, Claude Code, Codex, or other already-running agent apps so they inherit the new environment variables."
