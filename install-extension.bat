@echo off
echo ========================================
echo Inclusify - Dyslexia Helper Extension
echo ========================================
echo.
echo This script will help you install the extension in Chrome/Edge
echo.

REM Check if dist folder exists
if not exist "dist" (
    echo Error: dist folder not found!
    echo Please run 'npm run build' first.
    pause
    exit /b 1
)

echo Extension built successfully!
echo.
echo To install the extension:
echo.
echo 1. Open Chrome or Edge
echo 2. Go to chrome://extensions/ or edge://extensions/
echo 3. Enable "Developer mode" (toggle in top right)
echo 4. Click "Load unpacked"
echo 5. Select the 'dist' folder from this project
echo.
echo To test the extension:
echo.
echo 1. Open the test-extension.html file in your browser
echo 2. Or go to any website
echo 3. Look for the floating icon (📖) at the top right
echo 4. Click it to open the sidebar
echo 5. Enable the extension and try different features
echo.
echo The extension should now modify the website content, not the sidebar!
echo.

pause 