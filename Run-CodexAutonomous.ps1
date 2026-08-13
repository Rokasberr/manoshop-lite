$ErrorActionPreference = "Stop"

$runnerRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $runnerRoot

$currentBranch = (git branch --show-current).Trim()

if ($currentBranch -notlike "codex/autonomous-*") {
    throw "Autonominis runneris leidžiamas tik codex/autonomous-* branch."
}

$codexExecutable = $null

if (Get-Command codex.cmd -ErrorAction SilentlyContinue) {
    $codexExecutable = "codex.cmd"
}
elseif (Get-Command codex -ErrorAction SilentlyContinue) {
    $codexExecutable = "codex"
}
else {
    throw "Codex CLI nerastas."
}

$promptPath = Join-Path $runnerRoot "codex-work\PROMPT.md"
$statusPath = Join-Path $runnerRoot "codex-work\STATUS.md"
$localReportPath = Join-Path $runnerRoot "codex-work\LAST_RUN_REPORT.md"

if (-not (Test-Path $promptPath)) {
    throw "Nerastas PROMPT.md."
}

# Laikinai neleidžia Windows užmigti, kol veikia runneris.
if (-not ("CodexKeepAwake" -as [type])) {
    Add-Type @"
using System;
using System.Runtime.InteropServices;

public static class CodexKeepAwake
{
    [DllImport("kernel32.dll")]
    public static extern uint SetThreadExecutionState(uint esFlags);
}
"@
}

$ES_CONTINUOUS = [Convert]::ToUInt32("80000000", 16)
$ES_SYSTEM_REQUIRED = [uint32]0x00000001

[CodexKeepAwake]::SetThreadExecutionState(
    $ES_CONTINUOUS -bor $ES_SYSTEM_REQUIRED
) | Out-Null

$gitName = [string](git config user.name)
$gitEmail = [string](git config user.email)

$canCommit =
    -not [string]::IsNullOrWhiteSpace($gitName) -and
    -not [string]::IsNullOrWhiteSpace($gitEmail)

if (-not $canCommit) {
    Write-Warning "Git user.name arba user.email nenustatytas. Darbas vyks, bet automatiniai commitai bus praleisti."
}

$reportDirectory = Join-Path $env:TEMP "stilloak-codex-reports"
New-Item -ItemType Directory -Path $reportDirectory -Force | Out-Null

$basePrompt = Get-Content -Path $promptPath -Raw
$maxRuns = 6
$latestReport = $null

try {
    for ($run = 1; $run -le $maxRuns; $run++) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host "CODEX AUTONOMINIS ETAPAS $run IŠ $maxRuns" -ForegroundColor Cyan
        Write-Host "================================================" -ForegroundColor Cyan

        $beforeHead = (git rev-parse HEAD).Trim()
        $beforeWorkingTree = (@(git status --porcelain) -join "|")
        $beforeState = "$beforeHead|$beforeWorkingTree"

        $continuationPrompt = @"

Tai autonominio vykdymo etapas $run iš $maxRuns.

Perskaityk dabartinį STATUS.md ir tęsk nuo pirmo neužbaigto milestone.
Nekartok jau patikrintų darbų be priežasties.
Neapsiribok vien analize – realiai įgyvendink, tikrink, taisyk ir atnaujink progreso dokumentus.
"@

        $runPrompt = $basePrompt + $continuationPrompt
        $reportName = "stilloak-run-{0}-{1}.md" -f $run, (Get-Date -Format "yyyyMMdd-HHmmss")
        $latestReport = Join-Path $reportDirectory $reportName

        & $codexExecutable exec `
            --sandbox workspace-write `
            --ask-for-approval never `
            -c 'model_reasoning_effort="high"' `
            -c 'sandbox_workspace_write.network_access=false' `
            -o $latestReport `
            $runPrompt

        $codexExitCode = $LASTEXITCODE
        $safetyStop = $false

        # ----------------------------------------------------
        # SAUGUS AUTOMATINIS CHECKPOINT COMMIT
        # ----------------------------------------------------

        $changedFiles = @(git status --porcelain)

        if ($changedFiles.Count -gt 0) {
            git add -A

            $stagedFiles = @(git diff --cached --name-only)

            $sensitiveFiles = @(
                $stagedFiles | Where-Object {
                    $_ -match '(^|/)\.env($|\.)' -or
                    $_ -match '(^|/)(auth|credentials|secrets?)\.json$' -or
                    $_ -match '\.(pem|key|p12|pfx)$' -or
                    $_ -match '(^|/)id_rsa$'
                }
            )

            if ($sensitiveFiles.Count -gt 0) {
                Write-Warning "Aptikti galimai jautrūs failai. Jie nebus commitinami."

                foreach ($sensitiveFile in $sensitiveFiles) {
                    git restore --staged -- $sensitiveFile
                    Write-Warning "Neįtrauktas: $sensitiveFile"
                }

                $safetyStop = $true
            }

            $safeStagedFiles = @(git diff --cached --name-only)

            if ($safeStagedFiles.Count -gt 0 -and $canCommit) {
                git -c commit.gpgsign=false commit `
                    -m "checkpoint(codex): autonomous pass $run"

                if ($LASTEXITCODE -ne 0) {
                    Write-Warning "Checkpoint commit nepavyko. Darbas nestabdomas."
                }
            }
            elseif ($safeStagedFiles.Count -gt 0) {
                Write-Warning "Pakeitimai palikti staged būsenoje, nes nėra Git tapatybės."
            }
        }

        if ($safetyStop) {
            Write-Warning "Autonominis darbas sustabdytas dėl galimo jautraus failo pakeitimo."
            break
        }

        if ($codexExitCode -ne 0) {
            Write-Warning "Codex etapas baigėsi su klaidos kodu $codexExitCode."
            break
        }

        # ----------------------------------------------------
        # BAIGTUMO PATIKRA
        # ----------------------------------------------------

        if (Test-Path $statusPath) {
            $statusText = Get-Content -Path $statusPath -Raw

            if ($statusText -match '(?m)^PROJECT_STATE:\s*RELEASE_CANDIDATE_READY\s*$') {
                Write-Host ""
                Write-Host "RELEASE CANDIDATE BŪSENA PASIEKTA." -ForegroundColor Green
                break
            }
        }

        $afterHead = (git rev-parse HEAD).Trim()
        $afterWorkingTree = (@(git status --porcelain) -join "|")
        $afterState = "$afterHead|$afterWorkingTree"

        if ($afterState -eq $beforeState) {
            Write-Warning "Šiame etape nepadaryta jokios Git pažangos. Ciklas sustabdytas, kad be reikalo nekartotų darbo."
            break
        }

        Write-Host ""
        Write-Host "Etapas $run baigtas. Tęsiamas kitas etapas." -ForegroundColor Yellow
    }
}
finally {
    [CodexKeepAwake]::SetThreadExecutionState($ES_CONTINUOUS) | Out-Null
}

if ($latestReport -and (Test-Path $latestReport)) {
    Copy-Item -Path $latestReport -Destination $localReportPath -Force
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "AUTONOMINIS CODEX DARBAS BAIGTAS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Branch:"
git branch --show-current

Write-Host ""
Write-Host "Git būsena:"
git status --short

Write-Host ""
Write-Host "Paskutiniai commitai:"
git log --oneline -10

Write-Host ""
Write-Host "Progreso dokumentas:"
Write-Host "$runnerRoot\codex-work\STATUS.md"

Write-Host ""
Write-Host "Paskutinė Codex ataskaita:"
Write-Host "$runnerRoot\codex-work\LAST_RUN_REPORT.md"

