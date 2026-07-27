# ─── ADB Reverse Port Keepalive ──────────────────────────────────────────────
# Continuously re-establishes ADB reverse port forwarding every 15 seconds.
# ADB reverse tunnels are fragile — they drop when the phone screen locks,
# USB re-enumerates, or ADB server restarts. This script keeps them alive.
#
# Usage: Run in background alongside the backend server.
#   Start-Job -FilePath .\scripts\adb-keepalive.ps1
# ─────────────────────────────────────────────────────────────────────────────

$ports = @(5005, 8086)
$interval = 15  # seconds

Write-Host "[ADB Keepalive] Monitoring ports: $($ports -join ', ')" -ForegroundColor Cyan
Write-Host "[ADB Keepalive] Checking every ${interval}s. Press Ctrl+C to stop." -ForegroundColor DarkGray

while ($true) {
    try {
        $devices = adb devices 2>&1
        $hasDevice = $devices | Select-String -Pattern "\t(device|emulator)" -Quiet

        if ($hasDevice) {
            $currentList = (adb reverse --list 2>&1) -join " "

            foreach ($port in $ports) {
                if ($currentList -notmatch "tcp:$port") {
                    adb reverse tcp:$port tcp:$port 2>&1 | Out-Null
                    Write-Host "[ADB Keepalive] Restored tcp:$port → tcp:$port" -ForegroundColor Yellow
                }
            }
        }
    } catch {
        # Silently ignore errors (device temporarily disconnected, etc.)
    }

    Start-Sleep -Seconds $interval
}
