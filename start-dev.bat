@echo off
echo 🚀 Starting Kanban Development Environment
echo.

REM Check if backend is already running
netstat -ano | findstr :3005 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo ⚠️  Backend already running on port 3005
) else (
    echo 📦 Starting backend server...
    start "Backend Server" cmd /k "cd backend && npm run start:dev"
    echo ✅ Backend started
)

REM Check if frontend is already running
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo ⚠️  Frontend already running on port 3000
) else (
    echo 🎨 Starting frontend server...
    start "Frontend Server" cmd /k "cd frontend && npm run dev"
    echo ✅ Frontend started
)

echo.
echo ✨ Development environment ready!
echo    Backend:  http://localhost:3005
echo    Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
