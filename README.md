# 微前端Host應用

基於 Vue 3 + Webpack 5 Module Federation + Element Plus + TypeScript 構建的微前端Host應用。

## 🚀 技術棧

- **Vue 3** - 使用 Composition API
- **TypeScript** - 型別安全
- **Webpack 5** - Module Federation 微前端支援
- **Element Plus** - UI 組件庫
- **Vue Router** - 路由管理
- **Vue I18n** - 國際化支援（繁體中文/英文）

## 📁 專案結構

```
MF-Host/
├── src/
│   ├── components/          # 公共組件
│   ├── views/              # 頁面組件
│   │   ├── Home.vue        # 首頁
│   │   ├── RemoteApps.vue  # 微前端應用管理
│   │   └── RemoteAppContainer.vue  # 微前端應用容器
│   ├── router/             # 路由配置
│   │   └── index.ts
│   ├── i18n/              # 國際化配置
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── zh-TW.json  # 繁體中文
│   │       └── en.json     # 英文
│   ├── utils/             # 工具類
│   │   └── microfrontend.ts  # 微前端載入工具
│   ├── types/             # TypeScript 型別定義
│   │   └── global.d.ts
│   ├── App.vue            # 主應用組件
│   ├── main.ts            # 應用入口
│   └── shims-vue.d.ts     # Vue TypeScript 支援
├── public/
│   └── index.html
├── webpack.config.js       # Webpack 配置
├── tsconfig.json          # TypeScript 配置
├── package.json
└── README.md
```

## 🛠️ 建立步驟記錄

### 1. 初始化專案依賴

```bash
npm install vue@^3.4.0 vue-router@^4.2.5 element-plus@^2.4.4 @element-plus/icons-vue@^2.3.1 vue-i18n@^9.8.0
```

```bash
npm install -D typescript@^5.3.3 @types/node@^20.10.5 ts-loader@^9.5.1 fork-ts-checker-webpack-plugin@^9.0.2 @vue/compiler-sfc@^3.4.0 vue-loader@^17.4.2 webpack@^5.89.0 webpack-cli@^5.1.4 webpack-dev-server@^4.15.1 html-webpack-plugin@^5.6.0
```

### 2. TypeScript 配置

建立 `tsconfig.json`：
- 設定 ES2020 目標
- 啟用嚴格模式
- 配置路徑別名 `@/*`
- 支援 Vue 單文件組件

建立 `src/shims-vue.d.ts` 和 `src/types/global.d.ts` 提供型別支援。

### 3. Webpack Module Federation 配置

更新 `webpack.config.js`：
- 配置 TypeScript 支援（ts-loader）
- 設定 Module Federation 插件
- 配置共享依賴（vue, vue-router, element-plus, vue-i18n）
- 暴露主要模組（HostApp, Router, I18n）

### 4. Vue Router 設定

建立 `src/router/index.ts`：
- 配置路由表（首頁、微前端應用管理、應用容器）
- 設定路由守衛
- 支援動態路由參數

### 5. Vue I18n 國際化

建立 `src/i18n/index.ts` 和語言檔案：
- 支援繁體中文（預設）和英文
- 配置 Composition API 模式
- 提供完整的界面翻譯

### 6. Element Plus 整合

在 `src/main.ts` 中：
- 導入 Element Plus 和樣式
- 設定繁體中文語言包
- 註冊所有圖標組件
- 支援深色模式

### 7. 主要組件開發

#### App.vue
- 響應式導航欄
- 語言切換功能
- 深色/淺色模式切換
- 使用 Vue Router 和 i18n

#### Home.vue
- 功能特色展示
- 系統狀態監控
- 響應式設計

#### RemoteApps.vue
- 微前端應用列表管理
- 應用載入/卸載功能
- 動態添加應用
- 分頁顯示載入的應用

#### RemoteAppContainer.vue
- 單個微前端應用容器
- 應用載入狀態管理
- 錯誤處理

### 8. 微前端載入工具

建立 `src/utils/microfrontend.ts`：
- MicrofrontendLoader 類
- 動態載入遠程模組
- 應用生命週期管理
- 錯誤處理和狀態管理

## 🚀 啟動專案

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```
應用將在 http://localhost:3000 啟動

### 生產建置
```bash
npm run build
```

## 📋 Module Federation 配置

### Host 應用配置
```javascript
new ModuleFederationPlugin({
  name: 'mf_host',
  filename: 'remoteEntry.js',
  remotes: {
    // 添加遠程應用
    // 'mf_remote_app1': 'mf_remote_app1@http://localhost:3001/remoteEntry.js'
  },
  exposes: {
    './HostApp': './src/App.vue',
    './Router': './src/router/index.ts',
    './I18n': './src/i18n/index.ts'
  },
  shared: {
    vue: { singleton: true, requiredVersion: '^3.4.0', eager: true },
    'vue-router': { singleton: true, requiredVersion: '^4.2.5' },
    'element-plus': { singleton: true, requiredVersion: '^2.4.4' },
    'vue-i18n': { singleton: true, requiredVersion: '^9.8.0' }
  }
})
```

### 添加遠程應用

1. 在 `webpack.config.js` 的 `remotes` 中添加遠程應用：
```javascript
remotes: {
  'mf_remote_app1': 'mf_remote_app1@http://localhost:3001/remoteEntry.js'
}
```

2. 在 `RemoteApps.vue` 中添加應用配置：
```javascript
remoteApps.value.push({
  name: 'mf_remote_app1',
  description: '遠程應用1',
  url: 'http://localhost:3001/remoteEntry.js',
  module: './App',
  status: 'unloaded'
})
```

## 🎨 功能特色

### 🌐 多語言支援
- 繁體中文（預設）
- 英文
- 動態語言切換
- 本地儲存語言偏好

### 🌙 主題支援
- 淺色模式（預設）
- 深色模式
- 動態主題切換
- 本地儲存主題偏好

### 📱 響應式設計
- 支援桌面、平板、手機
- 彈性網格佈局
- 適應性導航欄

### 🔧 微前端管理
- 動態載入/卸載應用
- 應用狀態管理
- 錯誤處理和重試
- 應用隔離

## 🔗 相關資源

- [Vue 3 官方文檔](https://vuejs.org/)
- [Element Plus 組件庫](https://element-plus.org/)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [TypeScript 官方文檔](https://www.typescriptlang.org/)

## 📄 授權

MIT License

---

**建立完成日期：** 2024年

**技術支援：** Vue 3 + Webpack 5 Module Federation + Element Plus + TypeScript
