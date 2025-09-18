# 🧪 所有載入方式測試指南

## 🎯 **新增功能**

我已經為您建立了一個全面的載入方式測試工具，包含 **5 種不同的載入方法**，可以幫助診斷任何 Remote 專案的載入問題。

## 🔧 **測試工具功能**

### 📝 **Remote URL 輸入框**
- 可以自定義 Remote 應用的 URL
- 預設值：`http://localhost:3001/remoteEntry.js`
- 支援任何 Remote 應用的 `remoteEntry.js` URL

### 🧪 **測試所有載入方式按鈕**
點擊後會依序測試 5 種載入方法：

#### 方法 1: SystemJS 風格載入
- 使用 System.import 模擬載入
- 適合標準 Module Federation 應用

#### 方法 2: fetch + eval
- 直接 fetch remoteEntry.js 內容
- 使用 eval 執行腳本
- 最原始直接的方法

#### 方法 3: webpack import
- 使用 webpack 的 import() 語法
- 嘗試多個可能的模組路徑
- 依賴 Host 的 remotes 配置

#### 方法 4: 動態腳本載入
- 創建 `<script>` 標籤載入
- 等待容器自動註冊

#### 方法 5: 全域變數檢查載入
- 載入腳本後檢查所有可能的全域變數
- 嘗試多個容器名稱：`workflow`, `vue_flow_app`, `simple_remote`, `mf_remote`
- 嘗試多個模組路徑：`./App`, `./FlowManager`, `./CustomNode`, `./main`, `./index`

## 📊 **測試結果**

### 控制台輸出
測試會在控制台輸出詳細日誌：

```
🚀 開始測試所有載入方法...

=== 方法 1 (SystemJS) ===
結果: ✅ 成功
日誌: ['🔄 方法 1: SystemJS 風格載入', '📦 System.import: ...', '✅ 容器載入成功', ...]

=== 方法 2 (fetch-eval) ===
結果: ❌ 失敗
錯誤: Container initialization failed as it has already been initialized
日誌: ['🔄 方法 2: fetch + eval', '📥 Fetch: ...', ...]

📊 測試結果: 3/5 成功
```

### 自動載入
- 如果有任何方法成功，會自動使用第一個成功的方法載入組件
- 顯示成功訊息：`測試完成！成功方法: SystemJS (3/5)`

## 🔍 **診斷價值**

根據測試結果可以判斷問題所在：

### 如果方法 1 (SystemJS) 成功
✅ **Remote 應用正常**，可以正常載入

### 如果方法 2 (fetch-eval) 成功但其他失敗
✅ **Remote 腳本正常**，但可能有容器初始化問題

### 如果方法 3 (webpack import) 成功
✅ **Host 配置正確**，webpack remotes 設定正常

### 如果方法 4 (動態腳本) 成功
✅ **基本載入正常**，但可能有模組解析問題

### 如果方法 5 (全域變數檢查) 成功
✅ **容器註冊正常**，但可能容器名稱不是 `workflow`

### 如果所有方法都失敗
❌ **Remote 應用問題**：
- 檢查 URL 是否正確
- 檢查 Remote 應用是否運行
- 檢查 CORS 設定
- 檢查 Remote 的 Module Federation 配置

## 🚀 **使用步驟**

1. **設定 Remote URL**
   - 在輸入框中輸入您的 Remote 應用 URL
   - 例如：`http://localhost:3002/remoteEntry.js`

2. **點擊測試按鈕**
   - 點擊「測試所有載入方式」
   - 觀察控制台輸出

3. **查看結果**
   - 如果有方法成功，組件會自動載入
   - 如果全部失敗，檢查控制台錯誤訊息

## 💡 **常見問題解決**

### CORS 錯誤
```
Access to fetch at '...' has been blocked by CORS policy
```
**解決**: 在 Remote 應用的服務器添加 CORS 標頭

### 模組未找到
```
Cannot find module 'workflow/App'
```
**解決**: 檢查 Host 的 webpack remotes 配置

### 容器未註冊
```
容器未註冊
```
**解決**: 檢查 Remote 的 Module Federation 配置

### 容器初始化失敗
```
Container initialization failed
```
**解決**: 檢查共享依賴版本是否匹配

這個工具可以幫助您快速診斷任何 Remote 專案的載入問題！🎉
