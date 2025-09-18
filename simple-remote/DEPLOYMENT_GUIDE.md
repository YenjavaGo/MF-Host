# Simple Remote App 部署指南

## 部署步驟

1. **打包應用**
   ```bash
   npm run build
   ```

2. **複製到 Nginx 目錄**
   將 `dist` 目錄的所有內容複製到您的 Nginx 根目錄：
   ```
   E:/Test Project/Vue/Vue-Flow/dist/
   ```

3. **Nginx 配置**
   您提供的 Nginx 配置已經很完善：
   ```nginx
   server {
       listen       3001;
       server_name  localhost;
       root  "E:/Test Project/Vue/Vue-Flow";
       
       location / {
           alias  "E:/Test Project/Vue/Vue-Flow/dist/";
           try_files $uri $uri/ /index.html;
           
           add_header Access-Control-Allow-Origin *;
           add_header Access-Control-Allow-Headers *;
           add_header Access-Control-Allow-Methods GET,OPTIONS;
       }
   }
   ```

## 驗證部署

部署後，您可以通過以下方式驗證：

1. **檢查 remoteEntry.js**
   ```
   http://localhost:3001/remoteEntry.js
   ```
   應該返回 Module Federation 的 JavaScript 代碼

2. **檢查主頁面**
   ```
   http://localhost:3001/
   ```
   應該顯示 Simple Remote App 的界面

3. **測試 CORS**
   確保從 Host 應用 (localhost:8080) 可以訪問 Remote 資源

## 檔案清單

部署後的檔案結構：
```
dist/
├── remoteEntry.js      # Module Federation 入口檔案
├── main.js            # 主應用程式碼
├── index.html         # HTML 模板
├── 31.js              # Vue 等第三方庫
├── 157.js             # App 組件
├── 408.js             # FlowManager 組件
├── 628.js             # CustomNode 組件
└── 31.js.LICENSE.txt  # 授權檔案
```

## 暴露的模組

Remote 應用暴露以下模組供 Host 載入：

- `workflow/App` - 主應用組件
- `workflow/FlowManager` - 流程管理組件
- `workflow/CustomNode` - 自定義節點組件

## 故障排除

如果 Host 無法載入 Remote 組件，請檢查：

1. **網路連接**: 確保可以訪問 `http://localhost:3001/remoteEntry.js`
2. **CORS 設定**: 確保 Nginx 正確設定了 CORS 標頭
3. **版本相容**: 確保 Vue 和 Element Plus 版本相容
4. **容器名稱**: 確保 Host 使用正確的容器名稱 `workflow`

## 測試建議

1. 先在瀏覽器直接訪問 Remote 應用確保運行正常
2. 檢查瀏覽器開發者工具的 Network 標籤確認資源載入
3. 檢查 Console 是否有 Module Federation 相關錯誤
4. 使用 Host 應用的「分析 Remote」功能檢查配置
