# Simple Remote App

這是一個簡單的 Vue 3 + Module Federation Remote 應用，用於測試與 Host 應用的整合。

## 功能

- **主應用 (App.vue)**: 基本的遠程應用展示
- **FlowManager**: 工作流程管理組件
- **CustomNode**: 自定義節點組件

## 暴露的模組

- `./App` - 主應用組件
- `./FlowManager` - 流程管理組件  
- `./CustomNode` - 自定義節點組件

## 開發

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 打包
npm run build
```

## 部署

打包後將 `dist` 目錄部署到 Nginx，確保：

1. 設定正確的 CORS 標頭
2. `remoteEntry.js` 可以被存取
3. 所有靜態資源路徑正確

## 配置

- **容器名稱**: `workflow`
- **端口**: `3001`
- **remoteEntry**: `/remoteEntry.js`

## 與 Host 整合

Host 應用可以通過以下方式載入：

```javascript
import('workflow/App')
import('workflow/FlowManager')  
import('workflow/CustomNode')
```
