# CTBC 微前端Host應用 - Vue 3 + Module Federation + Element Plus

這是一個專為中國信託工作流程管理系統設計的微前端Host應用，基於 Vue 3、Webpack Module Federation 和 Element Plus 構建。

## 🏦 系統概述

CTBC 工作流程管理系統是一個企業級微前端架構平台，提供統一的工作流程管理入口，支援多個業務模組的動態載入和整合。

## 🚀 主要功能

### 🎯 CTBC Workflow 系統
- **工作流程管理**: 路由控制、流程管理、流程列表
- **AI助理**: 文件管理、流程管理、編輯器測試等 8 個子模組
- **ATM影像管理**: 系統參數、影片收檔、保全影片處理等
- **LLM**: Agent、提示詞設定、超參數設定、LLM歷程
- **ASR管理**: ASR對話紀錄
- **排程管理**: 排程設定、排程歷程
- **其他**: 系統管理、系統日誌

### 🔧 微前端管理
- **動態載入**: 支援遠端微前端應用的動態載入
- **模組管理**: 統一管理各業務模組
- **樣式隔離**: 確保不同模組間樣式不衝突

## 📦 技術架構

- **前端框架**: Vue 3.4.0 + TypeScript
- **構建工具**: Webpack 5.89.0 + Module Federation
- **UI 組件庫**: Element Plus 2.4.4
- **路由管理**: Vue Router 4.2.5
- **國際化**: Vue I18n 9.8.0

## 🛠️ 快速開始

### 環境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安裝和啟動
```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 訪問應用
# Host: http://localhost:3000
# Remote: http://localhost:3001
```

### 啟動遠端應用
```bash
# 進入遠端應用目錄
cd simple-remote

# 安裝依賴並啟動
npm install
npm run dev
```

## 📁 項目結構

```
├── src/
│   ├── views/
│   │   ├── Home.vue              # 首頁，包含快速入口
│   │   ├── CTBCWorkflow.vue      # CTBC 工作流程主頁面
│   │   └── RemoteApps.vue        # 微前端應用管理
│   ├── utils/
│   │   ├── workingRemoteLoader.ts # 遠端載入器（已修復樣式問題）
│   │   └── allLoadingMethods.ts   # 多種載入方法
│   ├── router/index.ts           # 路由配置
│   └── App.vue                   # 主應用入口
├── simple-remote/                # 示例遠端應用
│   ├── src/
│   │   ├── App.vue              # 遠端應用主組件
│   │   └── components/          # 遠端組件
│   └── webpack.config.js        # 遠端應用配置（已修復）
├── ctbc_workflow.html           # CTBC 原始 HTML（參考用）
└── webpack.config.js            # Host 應用配置
```

## 🎯 使用指南

### 1. 訪問 CTBC Workflow 系統
1. 啟動應用後訪問 http://localhost:3000
2. 點擊首頁的「CTBC 工作流程系統」卡片
3. 或直接訪問 `/ctbc-workflow` 路由

### 2. 使用側邊欄導航
- 左側選單包含所有業務模組
- 點擊任一選單項目載入對應的遠端應用
- 支援選單摺疊/展開

### 3. 遠端應用載入
- 已配置的模組會載入實際的遠端組件
- 未配置的模組顯示佔位內容
- 支援多種載入方法，確保穩定性

## 🔧 遠端應用配置

### 在 CTBCWorkflow.vue 中配置新的遠端應用：

```typescript
const remoteAppsConfig = reactive({
  'your-module-id': {
    url: 'http://localhost:3002/remoteEntry.js',
    module: './YourComponent'
  }
})
```

### 在 webpack.config.js 中添加遠端應用：

```javascript
remotes: {
  'your-app': 'your-app@http://localhost:3002/remoteEntry.js'
}
```

## 🎨 樣式修復

已解決微前端載入時的樣式丟失問題：

1. **統一開發模式**: Host 和 Remote 都使用 `development` 模式
2. **Vue 功能標誌**: 確保 Vue 配置一致
3. **優化配置**: 統一 `splitChunks: false` 設定
4. **熱更新支援**: 啟用 HMR 提升開發體驗

## 🚨 故障排除

### 遠端應用載入失敗
1. 確認遠端應用服務正在運行
2. 檢查 CORS 設定
3. 查看瀏覽器控制台錯誤訊息

### 樣式問題
1. 確保 Host 和 Remote 使用相同的 webpack 模式
2. 檢查 CSS loader 配置
3. 驗證 Vue 功能標誌設定

## 📄 授權

MIT License - 僅供學習和開發使用

## 🤝 開發團隊

如有問題或建議，請聯繫開發團隊。