@echo off
setlocal EnableDelayedExpansion
title ONEBind - Demo Startup
color 0A
mode con: cols=75 lines=50

echo.
echo  ===========================================================
echo  ^|                                                         ^|
echo  ^|         ONEBind Ecosystem - Demo Startup                ^|
echo  ^|         All Services + Mobile Port Forwarding           ^|
echo  ^|                                                         ^|
echo  ===========================================================
echo.
echo   [DB]  PostgreSQL               (port 5432)
echo   [B1]  ONEBind Backend          (port 5005)
echo   [B2]  Oneassist-CRM Backend    (port 8086)
echo   [B3]  CRM-oneassist Backend    (port 3000)
echo   [F1]  Oneassist-CRM Frontend   (port 5173)  Vite/React
echo   [F2]  CRM-oneassist Frontend   (port 4200)  Angular
echo   [ADB] Mobile port forwarding   (5005, 8086)
echo.
echo  ===========================================================
echo.

:: ═══════════════════════════════════════════════════════════════
:: STEP 1: Check PostgreSQL
:: ═══════════════════════════════════════════════════════════════
echo  [STEP 1/6] Checking PostgreSQL database...
echo.

set "PG_RUNNING=0"
for /f "tokens=*" %%s in ('sc query state^= all ^| findstr /i "postgresql" 2^>nul') do (
    set "PG_RUNNING=1"
)

if "!PG_RUNNING!"=="0" (
    echo   [WARN] No PostgreSQL service found!
    echo          All backends need PostgreSQL on port 5432.
    echo          Install PostgreSQL or start it manually.
    echo.
    echo   Press any key to continue anyway, or Ctrl+C to abort...
    pause >nul
) else (
    :: Check if it's actually running
    set "PG_STATUS=0"
    for /f "tokens=*" %%s in ('sc query state^= all ^| findstr /i "postgresql" ^| findstr /i "RUNNING" 2^>nul') do (
        set "PG_STATUS=1"
    )
    if "!PG_STATUS!"=="0" (
        echo   [WARN] PostgreSQL service found but NOT running!
        echo          Attempting to start...
        for /f "tokens=2 delims=:" %%a in ('sc query state^= all ^| findstr /i "SERVICE_NAME.*postgresql"') do (
            set "PG_SVC=%%a"
            set "PG_SVC=!PG_SVC: =!"
            net start "!PG_SVC!" >nul 2>&1
        )
        timeout /t 3 /nobreak >nul
        echo   [OK]   PostgreSQL start attempted.
    ) else (
        echo   [OK]   PostgreSQL is running on port 5432
    )
)
echo.

:: ═══════════════════════════════════════════════════════════════
:: STEP 2: Kill existing processes on all target ports
:: ═══════════════════════════════════════════════════════════════
echo  [STEP 2/6] Cleaning up existing processes on target ports...
echo.

set "KILLED=0"
for %%P in (5005 8086 3000 5173 4200) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%P ^| findstr LISTENING 2^>nul') do (
        echo   Killing process on port %%P (PID: %%a)
        taskkill /PID %%a /F >nul 2>&1
        set /a KILLED+=1
    )
)

if !KILLED! equ 0 (
    echo   [OK]   No conflicting processes found
) else (
    echo   [OK]   Killed !KILLED! process(es)
    timeout /t 2 /nobreak >nul
)
echo.

:: ═══════════════════════════════════════════════════════════════
:: STEP 3: Start all 3 Backends
:: ═══════════════════════════════════════════════════════════════
echo  [STEP 3/6] Starting backend servers...
echo.

:: ── B1: ONEBind Backend (port 5005) ──────────────────────────
if exist "C:\Users\vnali\CRMConnect\backend\package.json" (
    echo   [B1] ONEBind Backend on port 5005...
    start "B1-ONEBind-Backend-5005" cmd /k "title B1-ONEBind-Backend-5005 && cd /d C:\Users\vnali\CRMConnect\backend && npm run dev"
) else (
    echo   [SKIP] B1 - CRMConnect\backend not found
)
timeout /t 2 /nobreak >nul

:: ── B2: Oneassist-CRMConnect Backend (port 8086) ────────────
if exist "C:\Users\vnali\Oneassist-CRMConnect\backend\package.json" (
    echo   [B2] Oneassist-CRM Backend on port 8086...
    start "B2-Oneassist-CRM-Backend-8086" cmd /k "title B2-Oneassist-CRM-Backend-8086 && cd /d C:\Users\vnali\Oneassist-CRMConnect\backend && npm run dev"
) else (
    echo   [SKIP] B2 - Oneassist-CRMConnect\backend not found
)
timeout /t 2 /nobreak >nul

:: ── B3: CRM-oneassist-backend (port 3000) ───────────────────
:: NOTE: .env has PORT=3005, but Angular frontend expects port 3000.
::       We override PORT=3000 here so Angular frontend connects properly.
if exist "C:\Users\vnali\CRM-oneassist-backend\package.json" (
    echo   [B3] CRM-oneassist Backend on port 3000...
    start "B3-CRM-oneassist-Backend-3000" cmd /k "title B3-CRM-oneassist-Backend-3000 && cd /d C:\Users\vnali\CRM-oneassist-backend && set PORT=3000 && npm run dev"
) else (
    echo   [SKIP] B3 - CRM-oneassist-backend not found
)

:: Wait for backends to initialize before starting frontends
echo.
echo   Waiting for backends to initialize...
timeout /t 5 /nobreak >nul
echo   [OK]   Backends started
echo.

:: ═══════════════════════════════════════════════════════════════
:: STEP 4: Start all 2 Frontends
:: ═══════════════════════════════════════════════════════════════
echo  [STEP 4/6] Starting frontend servers...
echo.

:: ── F1: Oneassist-CRMConnect Frontend (Vite, port 5173) ─────
if exist "C:\Users\vnali\Oneassist-CRMConnect\package.json" (
    echo   [F1] Oneassist-CRM Frontend on port 5173 (Vite)...
    start "F1-Oneassist-CRM-Frontend-5173" cmd /k "title F1-Oneassist-CRM-Frontend-5173 && cd /d C:\Users\vnali\Oneassist-CRMConnect && npm run dev"
) else (
    echo   [SKIP] F1 - Oneassist-CRMConnect not found
)
timeout /t 2 /nobreak >nul

:: ── F2: CRM-oneassist-frontend (Angular, port 4200) ─────────
if exist "C:\Users\vnali\CRM-oneassist-frontend\package.json" (
    echo   [F2] CRM-oneassist Frontend on port 4200 (Angular)...
    start "F2-CRM-oneassist-Frontend-4200" cmd /k "title F2-CRM-oneassist-Frontend-4200 && cd /d C:\Users\vnali\CRM-oneassist-frontend && npx ng serve --port 4200"
) else (
    echo   [SKIP] F2 - CRM-oneassist-frontend not found
)
echo.
echo   [OK]   Frontends started
echo.

:: ═══════════════════════════════════════════════════════════════
:: STEP 5: ADB Port Forwarding for Mobile App
:: ═══════════════════════════════════════════════════════════════
echo  [STEP 5/6] Setting up ADB port forwarding for mobile app...
echo.

:: Check if adb exists
where adb >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   [SKIP] adb not found in PATH
    echo          Mobile app won't connect to local backends.
    echo          Add Android SDK platform-tools to your PATH.
    goto :adb_done
)

:: Check for connected device
set "DEVICE_FOUND=0"
for /f "skip=1 tokens=1,2" %%a in ('adb devices 2^>nul') do (
    if "%%b"=="device" (
        set "DEVICE_FOUND=1"
        set "DEVICE_ID=%%a"
    )
    if "%%b"=="unauthorized" (
        echo   [WARN] Device %%a is UNAUTHORIZED
        echo          Accept the USB debugging prompt on your phone!
        echo          Then re-run this script.
    )
)

if "!DEVICE_FOUND!"=="0" (
    echo   [SKIP] No authorized Android device detected.
    echo          Connect device via USB, enable USB debugging,
    echo          and accept the prompt on the phone.
    goto :adb_done
)

echo   Device: !DEVICE_ID!
echo.

:: Forward all ports the mobile app needs
set "ADB_OK=0"
set "ADB_FAIL=0"

:: Port 5005 - ONEBind Backend (auth, leads, payouts)
adb reverse tcp:5005 tcp:5005 >nul 2>&1
if !ERRORLEVEL! equ 0 (
    echo   [OK]   tcp:5005  ONEBind Backend (auth, leads, payouts)
    set /a ADB_OK+=1
) else (
    echo   [FAIL] tcp:5005  Could not forward
    set /a ADB_FAIL+=1
)

:: Port 8086 - Oneassist-CRM Backend (invoices, wallet, withdrawals)
adb reverse tcp:8086 tcp:8086 >nul 2>&1
if !ERRORLEVEL! equ 0 (
    echo   [OK]   tcp:8086  Oneassist-CRM Backend (invoices, wallet)
    set /a ADB_OK+=1
) else (
    echo   [FAIL] tcp:8086  Could not forward
    set /a ADB_FAIL+=1
)

echo.
if !ADB_FAIL! equ 0 (
    echo   [OK]   All !ADB_OK! ports forwarded to device
) else (
    echo   [WARN] !ADB_FAIL! port(s) failed to forward
)

:adb_done
echo.

:: ═══════════════════════════════════════════════════════════════
:: STEP 6: Health Check - verify backends respond
:: ═══════════════════════════════════════════════════════════════
echo  [STEP 6/6] Verifying backend connectivity...
echo.
echo   Waiting 8 seconds for servers to be ready...
timeout /t 8 /nobreak >nul
echo.

:: Check each backend with curl (if available) or PowerShell
where curl >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "USE_CURL=1"
) else (
    set "USE_CURL=0"
)

set "HEALTH_OK=0"
set "HEALTH_FAIL=0"

:: Check B1 - ONEBind Backend (5005)
if "!USE_CURL!"=="1" (
    curl -s -o nul -w "%%{http_code}" --connect-timeout 5 http://localhost:5005/api >"%TEMP%\hc_5005.txt" 2>nul
    set /p HC_5005=<"%TEMP%\hc_5005.txt"
    del "%TEMP%\hc_5005.txt" 2>nul
) else (
    for /f %%i in ('powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:5005/api -UseBasicParsing -TimeoutSec 5).StatusCode } catch { Write-Output 0 }"') do set "HC_5005=%%i"
)
if "!HC_5005!"=="0" (
    echo   [FAIL] B1  ONEBind Backend      http://localhost:5005  NOT RESPONDING
    set /a HEALTH_FAIL+=1
) else (
    echo   [OK]   B1  ONEBind Backend      http://localhost:5005  (status: !HC_5005!)
    set /a HEALTH_OK+=1
)

:: Check B2 - Oneassist-CRM Backend (8086)
if "!USE_CURL!"=="1" (
    curl -s -o nul -w "%%{http_code}" --connect-timeout 5 http://localhost:8086 >"%TEMP%\hc_8086.txt" 2>nul
    set /p HC_8086=<"%TEMP%\hc_8086.txt"
    del "%TEMP%\hc_8086.txt" 2>nul
) else (
    for /f %%i in ('powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:8086 -UseBasicParsing -TimeoutSec 5).StatusCode } catch { Write-Output 0 }"') do set "HC_8086=%%i"
)
if "!HC_8086!"=="0" (
    echo   [FAIL] B2  Oneassist-CRM API    http://localhost:8086  NOT RESPONDING
    set /a HEALTH_FAIL+=1
) else (
    echo   [OK]   B2  Oneassist-CRM API    http://localhost:8086  (status: !HC_8086!)
    set /a HEALTH_OK+=1
)

:: Check B3 - CRM-oneassist Backend (3000)
if "!USE_CURL!"=="1" (
    curl -s -o nul -w "%%{http_code}" --connect-timeout 5 http://localhost:3000 >"%TEMP%\hc_3000.txt" 2>nul
    set /p HC_3000=<"%TEMP%\hc_3000.txt"
    del "%TEMP%\hc_3000.txt" 2>nul
) else (
    for /f %%i in ('powershell -Command "try { (Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 5).StatusCode } catch { Write-Output 0 }"') do set "HC_3000=%%i"
)
if "!HC_3000!"=="0" (
    echo   [FAIL] B3  CRM-oneassist API    http://localhost:3000  NOT RESPONDING
    set /a HEALTH_FAIL+=1
) else (
    echo   [OK]   B3  CRM-oneassist API    http://localhost:3000  (status: !HC_3000!)
    set /a HEALTH_OK+=1
)

echo.

:: ═══════════════════════════════════════════════════════════════
:: FINAL STATUS DASHBOARD
:: ═══════════════════════════════════════════════════════════════
echo.
echo  ===========================================================
if !HEALTH_FAIL! equ 0 (
    echo  ^|     ALL SYSTEMS READY FOR DEMO!                       ^|
) else (
    echo  ^|     WARNING: !HEALTH_FAIL! BACKEND(S) NOT RESPONDING           ^|
)
echo  ===========================================================
echo.
echo   BACKENDS:
echo     B1  ONEBind Backend       http://localhost:5005
echo     B2  Oneassist-CRM API     http://localhost:8086
echo     B3  CRM-oneassist API     http://localhost:3000
echo.
echo   FRONTENDS:
echo     F1  Oneassist-CRM Admin   http://localhost:5173
echo     F2  CRM Angular App       http://localhost:4200
echo.
echo   MOBILE APP (ADB):
echo     Port 5005 -^> ONEBind Backend  (login, leads, payouts)
echo     Port 8086 -^> Oneassist-CRM    (invoices, wallet)
echo.
echo  -----------------------------------------------------------
echo   TROUBLESHOOTING:
echo.
echo   Backend not responding?
echo     - Check the backend window for errors
echo     - Verify PostgreSQL is running (port 5432)
echo     - Run: netstat -an ^| findstr :5005
echo.
echo   Mobile app "Network request failed"?
echo     - Replug USB and re-run: adb reverse tcp:5005 tcp:5005
echo     - Check: adb reverse --list
echo     - Verify backend window shows incoming requests
echo.
echo   Port already in use?
echo     - Close this script and re-run (it auto-kills old processes)
echo     - Manual kill: taskkill /F /PID ^<pid^>
echo  -----------------------------------------------------------
echo.
echo   Press any key to exit (all services keep running)
echo  ===========================================================
pause >nul
endlocal
