# ─── ONEBind Dev Startup Script ───────────────────────────────────────────
# This script starts the backend server and sets up adb reverse port forwarding.
# Run from project root: .\scripts\start-dev.ps1
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Continue"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  ONEBind Dev Environment Startup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# ─── Step 1: Setup ADB Reverse ──────────────────────────────────────────────
Write-Host "`n[1/3] Setting up ADB reverse port forwarding..." -ForegroundColor Yellow

$devices = adb devices 2>&1
$hasDevice = $devices | Select-String -Pattern "\t(device|emulator)" -Quiet

if ($hasDevice) {
    Write-Host "  Device detected. Setting up port forwarding..." -ForegroundColor Green
    adb reverse tcp:5005 tcp:5005 2>&1 | Out-Null
    adb reverse tcp:8081 tcp:8081 2>&1 | Out-Null
    Write-Host "  ✓ ADB reverse configured (5005 & 8081)" -ForegroundColor Green
    
    # Show current reverse list
    $reverseList = adb reverse --list 2>&1
    Write-Host "  Current forwards: $reverseList" -ForegroundColor DarkGray

    # Start keepalive job — re-establishes dropped tunnels every 15s
    $keepalivePath = Join-Path (Split-Path $MyInvocation.MyCommand.Path) "adb-keepalive.ps1"
    if (Test-Path $keepalivePath) {
        $global:adbJob = Start-Job -FilePath $keepalivePath
        Write-Host "  ✓ ADB keepalive running (restores dropped tunnels)" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠ No device connected. ADB reverse skipped." -ForegroundColor DarkYellow
    Write-Host "    Connect device and run:" -ForegroundColor DarkYellow
    Write-Host "      adb reverse tcp:5005 tcp:5005" -ForegroundColor DarkYellow
}

# ─── Step 2: Check if backend is already running ────────────────────────────
Write-Host "`n[2/3] Checking if backend is already running..." -ForegroundColor Yellow

$portInUse = $false
try {
    $conn = Get-NetTCPConnection -LocalPort 5005 -ErrorAction SilentlyContinue
    if ($conn) {
        $portInUse = $true
        Write-Host "  ✓ Backend already running on port 5005" -ForegroundColor Green
    }
} catch {}

# ─── Step 3: Start backend server ───────────────────────────────────────────
if (-not $portInUse) {
    Write-Host "`n[3/3] Starting backend server..." -ForegroundColor Yellow
    
    $backendPath = Join-Path $ProjectRoot "backend"
    
    if (-not (Test-Path (Join-Path $backendPath "node_modules"))) {
        Write-Host "  Installing backend dependencies..." -ForegroundColor DarkYellow
        Push-Location $backendPath
        npm install
        Pop-Location
    }

    Write-Host "  Starting server on port 5005..." -ForegroundColor Green
    Write-Host "  Press Ctrl+C to stop`n" -ForegroundColor DarkGray
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  Backend: http://localhost:5005" -ForegroundColor Green
    Write-Host "  ADB:     localhost:5005 → device" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Start the backend (this blocks — keeps running)
    Push-Location $backendPath
    node src/server.js
    Pop-Location
} else {
    Write-Host "`n=====================================" -ForegroundColor Cyan
    Write-Host "  Everything is already running! ✓" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
}
