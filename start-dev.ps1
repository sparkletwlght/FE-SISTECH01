# PowerShell script untuk menjalankan backend dan frontend secara bersamaan

Write-Host "🚀 Starting Bibliotheca Development Environment..." -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL is running
Write-Host "📊 Checking PostgreSQL connection..." -ForegroundColor Yellow

$env:PGPASSWORD = "yuningge"
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCmd) {
    $fallbackPsql = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    if ($fallbackPsql) {
        $psqlExecutable = $fallbackPsql
    }
} else {
    $psqlExecutable = "psql"
}

$pgConnected = $false
if ($psqlExecutable) {
    try {
        $output = & $psqlExecutable -h localhost -p 5432 -U postgres -d database_buku -c "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $pgConnected = $true
        }
    } catch {}
}

if (-not $pgConnected) {
    # Fallback check via port 5432
    $tcp = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
    if ($tcp.TcpTestSucceeded) {
        $pgConnected = $true
    }
}

if ($pgConnected) {
    Write-Host "✅ PostgreSQL connected successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL tidak terhubung!" -ForegroundColor Red
    Write-Host "Pastikan service PostgreSQL berjalan dan database 'database_buku' sudah dibuat." -ForegroundColor Yellow
    Write-Host "Lihat README-SETUP.md untuk panduan setup database." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔧 Starting Backend Server (Port 3001)..." -ForegroundColor Cyan

# Start backend in new window
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd server; npm start"

Start-Sleep -Seconds 3

Write-Host "🎨 Starting Frontend Development Server (Port 5173)..." -ForegroundColor Cyan

# Start frontend in new window  
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "✨ Development environment started!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Magenta
Write-Host "🔌 Backend API: http://localhost:3001/api" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to exit this script (servers will keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
