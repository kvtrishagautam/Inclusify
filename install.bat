@echo off
echo ========================================
echo    Inclusify - Dyslexia Helper
echo    Extension Builder
echo ========================================
echo.

echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building extension...
npm run build

if %errorlevel% neq 0 (
    echo Error: Failed to build extension
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Build completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Open Chrome/Edge
echo 2. Go to chrome://extensions/ or edge://extensions/
echo 3. Enable "Developer mode"
echo 4. Click "Load unpacked"
echo 5. Select the "dist" folder from this project
echo.
echo The extension is now ready to use!
echo.
pause 