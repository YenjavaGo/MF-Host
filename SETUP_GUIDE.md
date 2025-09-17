# 微前端Host應用建立指南

本文檔詳細記錄了從零開始建立 Vue 3 + Webpack 5 Module Federation + Element Plus + TypeScript 微前端Host應用的完整步驟。

## 📋 建立步驟清單

### ✅ 步驟 1: 檢查並更新專案依賴

#### 1.1 更新 package.json 依賴

**生產依賴：**
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.5", 
    "element-plus": "^2.4.4",
    "@element-plus/icons-vue": "^2.3.1",
    "vue-i18n": "^9.8.0"
  }
}
```

**開發依賴：**
```json
{
  "devDependencies": {
    "@babel/core": "^7.23.6",
    "@babel/preset-env": "^7.23.6",
    "@vue/compiler-sfc": "^3.4.0",
    "babel-loader": "^9.1.3",
    "css-loader": "^6.8.1",
    "file-loader": "^6.2.0",
    "html-webpack-plugin": "^5.6.0",
    "style-loader": "^3.3.3",
    "vue-loader": "^17.4.2",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1",
    "typescript": "^5.3.3",
    "@types/node": "^20.10.5",
    "ts-loader": "^9.5.1",
    "fork-ts-checker-webpack-plugin": "^9.0.2"
  }
}
```

#### 1.2 安裝命令
```bash
npm install
```

### ✅ 步驟 2: 設置 TypeScript 配置

#### 2.1 建立 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["node", "webpack-env"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx", 
    "src/**/*.vue",
    "src/**/*.d.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

#### 2.2 建立 TypeScript 型別定義文件

**src/shims-vue.d.ts:**
```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@element-plus/icons-vue'
```

**src/types/global.d.ts:**
```typescript
declare global {
  interface Window {
    __MICRO_APP_ENVIRONMENT__: boolean
  }

  const __webpack_share_scopes__: {
    default: any
  }
}

declare module '*remoteEntry.js' {
  const content: {
    get: (module: string) => () => Promise<any>
    init: (shareScope: any) => Promise<void>
  }
  export default content
}

export {}
```

### ✅ 步驟 3: 更新 Webpack 配置支援 Module Federation

#### 3.1 更新 webpack.config.js

**主要變更：**
- 將入口點改為 `./src/main.ts`
- 添加 TypeScript 支援（ts-loader）
- 添加 ForkTsCheckerWebpackPlugin
- 配置 Module Federation
- 更新共享依賴

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  target: 'web',
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.vue', '.json'],
    alias: {
      '@': require('path').resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true
        },
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        extensions: {
          vue: {
            enabled: true,
            compiler: '@vue/compiler-sfc'
          }
        }
      }
    }),
    new ModuleFederationPlugin({
      name: 'mf_host',
      filename: 'remoteEntry.js',
      remotes: {
        // 這裡可以添加遠程微前端應用
      },
      exposes: {
        './HostApp': './src/App.vue',
        './Router': './src/router/index.ts',
        './I18n': './src/i18n/index.ts'
      },
      shared: {
        vue: {
          singleton: true,
          requiredVersion: '^3.4.0',
          eager: true
        },
        'vue-router': {
          singleton: true,
          requiredVersion: '^4.2.5'
        },
        'element-plus': {
          singleton: true,
          requiredVersion: '^2.4.4'
        },
        'vue-i18n': {
          singleton: true,
          requiredVersion: '^9.8.0'
        }
      }
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: true,
      title: '微前端Host應用 - Vue 3 + Module Federation + Element Plus'
    })
  ]
};
```

### ✅ 步驟 4: 設置繁體中文語言支援

#### 4.1 建立 Vue I18n 配置

**src/i18n/index.ts:**
```typescript
import { createI18n } from 'vue-i18n'
import zhTW from './locales/zh-TW.json'
import en from './locales/en.json'

export type MessageLanguages = 'zh-TW' | 'en'

const messages = {
  'zh-TW': zhTW,
  'en': en
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en',
  messages,
  globalInjection: true
})

export default i18n
```

#### 4.2 建立語言文件

**src/i18n/locales/zh-TW.json:** (繁體中文翻譯)
**src/i18n/locales/en.json:** (英文翻譯)

### ✅ 步驟 5: 轉換現有文件為 TypeScript

#### 5.1 重命名 main.js 為 main.ts
```bash
move src\main.js src\main.ts
```

#### 5.2 更新 main.ts
```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// Element Plus 相關導入
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhTw from 'element-plus/es/locale/lang/zh-tw'

const app = createApp(App)

app.use(router)
app.use(i18n)
app.use(ElementPlus, { locale: zhTw })

// 註冊所有Element Plus圖標
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.config.globalProperties.$ELEMENT = {
  size: 'default',
  zIndex: 3000
}

app.mount('#app')
```

### ✅ 步驟 6: 建立路由系統

#### 6.1 建立 src/router/index.ts
```typescript
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import RemoteApps from '@/views/RemoteApps.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首頁' }
  },
  {
    path: '/remote-apps',
    name: 'RemoteApps',
    component: RemoteApps,
    meta: { title: '微前端應用' }
  },
  {
    path: '/remote/:appName',
    name: 'RemoteApp',
    component: () => import('@/views/RemoteAppContainer.vue'),
    meta: { title: '微前端應用' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 微前端Host應用`
  }
  next()
})

export default router
```

### ✅ 步驟 7: 建立視圖組件

#### 7.1 建立 src/views/Home.vue
- 使用 TypeScript Composition API
- 展示專案特色
- 系統狀態監控
- 響應式設計

#### 7.2 建立 src/views/RemoteApps.vue
- 微前端應用管理
- 動態載入/卸載功能
- 應用狀態顯示
- 添加新應用功能

#### 7.3 建立 src/views/RemoteAppContainer.vue
- 單個應用容器
- 載入狀態管理
- 錯誤處理

### ✅ 步驟 8: 更新主應用組件

#### 8.1 更新 src/App.vue
- 使用 TypeScript Composition API
- 整合路由和 i18n
- 添加語言切換功能
- 添加深色模式切換
- 響應式導航欄

### ✅ 步驟 9: 建立微前端工具類

#### 9.1 建立 src/utils/microfrontend.ts
```typescript
export interface MicrofrontendConfig {
  name: string
  url: string
  module: string
  props?: Record<string, any>
  onMount?: (app: any) => void
  onUnmount?: (app: any) => void
  onError?: (error: Error) => void
}

class MicrofrontendLoader {
  // 實現動態載入邏輯
  async loadApp(config: MicrofrontendConfig, container: HTMLElement): Promise<any>
  async unloadApp(name: string): Promise<void>
  async reloadApp(name: string): Promise<any>
  // ... 其他方法
}

export const microfrontendLoader = new MicrofrontendLoader()
```

### ✅ 步驟 10: 建立文檔

#### 10.1 建立 README.md
- 專案介紹
- 技術棧說明
- 專案結構
- 使用指南
- 功能特色

#### 10.2 建立 SETUP_GUIDE.md（本文檔）
- 詳細建立步驟
- 配置說明
- 故障排除

## 🚀 啟動和測試

### 啟動開發伺服器
```bash
npm run dev
```

### 驗證功能
1. 訪問 http://localhost:3000
2. 測試導航功能
3. 測試語言切換
4. 測試深色模式
5. 測試微前端應用管理

## 🔧 故障排除

### 常見問題

1. **TypeScript 編譯錯誤**
   - 檢查 tsconfig.json 配置
   - 確保型別定義文件正確

2. **Module Federation 載入失敗**
   - 檢查遠程應用是否正在運行
   - 確認 remoteEntry.js 路徑正確

3. **Element Plus 樣式問題**
   - 確保正確導入 CSS 文件
   - 檢查深色模式配置

4. **i18n 翻譯不顯示**
   - 檢查語言文件路徑
   - 確認 i18n 配置正確

## ✅ 完成檢查清單

- [x] 依賴更新和安裝
- [x] TypeScript 配置
- [x] Webpack Module Federation 配置
- [x] Element Plus 整合
- [x] Vue Router 設定
- [x] Vue I18n 國際化
- [x] 主要組件開發
- [x] 微前端工具類
- [x] 響應式設計
- [x] 深色模式支援
- [x] 文檔撰寫

## 📝 總結

本指南涵蓋了建立完整微前端Host應用的所有步驟，包括：

1. **技術棧整合** - Vue 3 + TypeScript + Element Plus
2. **微前端架構** - Webpack 5 Module Federation
3. **國際化支援** - Vue I18n 繁體中文/英文
4. **現代化開發** - Composition API + 響應式設計
5. **完整功能** - 路由管理、狀態管理、主題切換

專案已準備好作為微前端架構的Host端，可以動態載入和管理其他微前端應用。
