@echo off
echo 正在部署修復後的 Simple Remote 應用...

echo.
echo 1. 檢查源檔案...
if not exist "simple-remote\dist\remoteEntry.js" (
    echo 錯誤: remoteEntry.js 不存在，請先執行 npm run build
    pause
    exit /b 1
)

echo 2. 建立目標目錄...
if not exist "E:\Test Project\Vue\Vue-Flow\dist" (
    mkdir "E:\Test Project\Vue\Vue-Flow\dist"
)

echo 3. 複製檔案...
copy "simple-remote\dist\*" "E:\Test Project\Vue\Vue-Flow\dist\" >nul

echo 4. 驗證部署...
if exist "E:\Test Project\Vue\Vue-Flow\dist\remoteEntry.js" (
    echo ✅ remoteEntry.js 部署成功
) else (
    echo ❌ remoteEntry.js 部署失敗
)

if exist "E:\Test Project\Vue\Vue-Flow\dist\index.html" (
    echo ✅ index.html 部署成功
) else (
    echo ❌ index.html 部署失敗
)

echo.
echo 部署完成！
echo.
echo 請測試以下連結：
echo - Remote 應用: http://localhost:3001/
echo - Remote Entry: http://localhost:3001/remoteEntry.js
echo.
echo 然後在 Host 應用中測試載入 Remote 組件
pause
