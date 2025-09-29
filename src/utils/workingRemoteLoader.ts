/**
 * 工作中的遠程載入器
 * 基於測試結果，使用已驗證有效的載入方法
 */

export interface WorkingLoadResult {
  success: boolean
  component?: any
  method: string
  error?: string
}

export class WorkingRemoteLoader {
  
  /**
   * 使用 SystemJS 風格載入（已驗證有效）
   */
  async loadWithSystemJS(remoteUrl: string = 'http://localhost:3001/workflow/remoteEntry.js'): Promise<WorkingLoadResult> {
    console.log('🚀 使用 SystemJS 風格載入 Remote（已驗證方法）')
    
    try {
      // 創建 System 風格的載入器
      const System = {
        import: async (url: string) => {
          console.log(`📦 System.import: ${url}`)
          return new Promise((resolve, reject) => {
            // 檢查是否已載入
            const existingScript = document.querySelector(`script[src="${url}"]`)
            if (existingScript) {
              console.log('✅ 腳本已存在，檢查容器...')
              const globalThis_ = globalThis as any
              if (globalThis_.workflow) {
                resolve(globalThis_.workflow)
                return
              }
            }
            
            const script = document.createElement('script')
            script.src = url
            script.onload = () => {
              console.log('✅ 腳本載入完成')
              // 等待容器註冊
              setTimeout(() => {
                const globalThis_ = globalThis as any
                if (globalThis_.workflow) {
                  console.log('✅ 找到 workflow 容器')
                  resolve(globalThis_.workflow)
                } else {
                  reject(new Error('容器未註冊'))
                }
              }, 100)
            }
            script.onerror = (error) => {
              console.error('❌ 腳本載入失敗:', error)
              reject(error)
            }
            document.head.appendChild(script)
          })
        }
      }
      
      // 使用 System.import
      const container = await System.import(remoteUrl) as any
      console.log('✅ System.import 成功')
      
      // 檢查容器是否已初始化，避免重複初始化錯誤
      if (!container._initialized) {
        const globalThis_ = globalThis as any
        const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
        console.log('🔧 初始化容器...')
        await container.init(sharedScope)
        container._initialized = true
        console.log('✅ 容器初始化完成')
      } else {
        console.log('✅ 容器已初始化，跳過初始化')
      }
      
      // 不載入組件，只載入容器
      console.log('✅ 容器載入完成')
      return {
        success: true,
        component: null, // 不載入組件
        method: 'systemjs-style'
      }
      
    } catch (error) {
      console.error('❌ SystemJS 載入失敗:', error)
      return {
        success: false,
        method: 'systemjs-style',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }
  
  /**
   * 備用方法：直接 fetch + eval
   */
  async loadWithFetchEval(remoteUrl: string = 'http://localhost:3001/workflow/remoteEntry.js'): Promise<WorkingLoadResult> {
    console.log('🔧 使用 fetch + eval 載入 Remote（備用方法）')
    
    try {
      // 1. Fetch remoteEntry.js
      console.log(`📥 正在 fetch: ${remoteUrl}`)
      const response = await fetch(remoteUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const scriptContent = await response.text()
      console.log(`✅ 取得腳本內容 (${scriptContent.length} 字元)`)
      
      // 2. 執行腳本
      console.log('🔧 執行 remoteEntry.js')
      eval(scriptContent)
      
      // 3. 等待容器出現
      console.log('⏳ 等待容器註冊...')
      await this.sleep(10000)
      
      const globalThis_ = globalThis as any
      const container = globalThis_.workflow
      
      if (!container) {
        throw new Error('容器未註冊到 globalThis.workflow')
      }
      
      console.log('✅ 找到容器')
      
      // 4. 檢查並初始化容器
      if (!container._initialized) {
        console.log('🔧 初始化容器...')
        const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
        await container.init(sharedScope)
        container._initialized = true
        console.log('✅ 容器初始化完成')
      } else {
        console.log('✅ 容器已初始化，跳過初始化')
      }
      
      // 5. 載入模組
      console.log('📦 載入 ./App 模組...')
      const factory = await container.get('./App')
      const module = factory()
      const component = module.default || module
      
      console.log('✅ fetch + eval 載入成功')
      return {
        success: true,
        component,
        method: 'fetch-eval'
      }
      
    } catch (error) {
      console.error('❌ fetch + eval 載入失敗:', error)
      return {
        success: false,
        method: 'fetch-eval',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }
  
  /**
   * 智能載入：嘗試最佳方法
   */
  async smartLoad(remoteUrl: string = 'http://localhost:3001/workflow/remoteEntry.js'): Promise<WorkingLoadResult> {
    console.log('🧠 開始智能載入...')
    
    // 方法 1: SystemJS 風格（已驗證有效）
    const result1 = await this.loadWithSystemJS(remoteUrl)
    if (result1.success) {
      console.log('🎉 智能載入成功：SystemJS 方法')
      return result1
    }
    
    // 方法 2: fetch + eval（備用）
    const result2 = await this.loadWithFetchEval(remoteUrl)
    if (result2.success) {
      console.log('🎉 智能載入成功：fetch + eval 方法')
      return result2
    }
    
    // 所有方法都失敗
    console.error('❌ 智能載入失敗：所有方法都失敗')
    return {
      success: false,
      method: 'smart-load',
      error: `SystemJS 失敗: ${result1.error}, fetch+eval 失敗: ${result2.error}`
    }
  }
  
  /**
   * 載入特定模組 - 多種方法嘗試
   */
  async loadModule(moduleName: string = './App', remoteUrl: string = 'http://localhost:3001/workflow/remoteEntry.js'): Promise<any> {
    console.log(`📦 載入特定模組: ${moduleName}`)
    
    // 如果是 LLM 應用，確保 chunk 攔截器已設置
    if (remoteUrl.includes('localhost:3003')) {
      this.ensureChunkInterceptor()
    }
    
    // 方法 1: 標準容器載入
    try {
      console.log('🔄 方法 1: 標準容器載入')
      return await this.loadModuleStandard(moduleName, remoteUrl)
    } catch (error) {
      console.log(`❌ 方法 1 失敗: ${error}`)
    }
    
    // 方法 2: 直接 fetch + eval
    try {
      console.log('🔄 方法 2: 直接 fetch + eval')
      return await this.loadModuleFetchEval(moduleName, remoteUrl)
    } catch (error) {
      console.log(`❌ 方法 2 失敗: ${error}`)
    }
    
    // 方法 3: 動態 import
    try {
      console.log('🔄 方法 3: 動態 import')
      return await this.loadModuleDynamicImport(moduleName, remoteUrl)
    } catch (error) {
      console.log(`❌ 方法 3 失敗: ${error}`)
    }
    
    // 方法 4: 手動腳本注入
    try {
      console.log('🔄 方法 4: 手動腳本注入')
      return await this.loadModuleManualInjection(moduleName, remoteUrl)
    } catch (error) {
      console.log(`❌ 方法 4 失敗: ${error}`)
    }
    
    // 方法 5: LLM 專用修復（處理 publicPath 問題）
    try {
      console.log('🔄 方法 5: LLM 專用修復')
      return await this.loadModuleLLMFix(moduleName, remoteUrl)
    } catch (error) {
      console.log(`❌ 方法 5 失敗: ${error}`)
    }
    
    // 方法 6: 強制 chunk 修復
    try {
      console.log('🔄 方法 6: 強制 chunk 修復')
      return await this.loadModuleChunkFix(moduleName, remoteUrl)
    } catch (error) {
      console.log(`❌ 方法 6 失敗: ${error}`)
    }
    
    // 方法 7: LLM 專用強制修復
    try {
      console.log('🔄 方法 7: LLM 專用強制修復')
      return await this.loadModuleLLMForceFix(moduleName, remoteUrl)
    } catch (error) {
      console.log(`❌ 方法 7 失敗: ${error}`)
    }
    
    // 方法 8: 手動 chunk 載入
    try {
      console.log('🔄 方法 8: 手動 chunk 載入')
      return await this.loadModuleManualChunk(moduleName, remoteUrl)
    } catch (error) {
      console.log(`❌ 方法 8 失敗: ${error}`)
    }
    
    // 方法 9: 直接修復 webpack 配置
    try {
      console.log('🔄 方法 9: 直接修復 webpack 配置')
      return await this.loadModuleWebpackFix(moduleName, remoteUrl)
    } catch (error) {
      console.log(`❌ 方法 9 失敗: ${error}`)
    }
    
    // 所有方法都失敗
    throw new Error(`所有載入方法都失敗，無法載入模組 ${moduleName}`)
  }
  
  /**
   * 方法 1: 標準容器載入
   */
  private async loadModuleStandard(moduleName: string, remoteUrl: string): Promise<any> {
    // 先確保容器已載入
    const result = await this.loadContainerOnly(remoteUrl)
    
    if (!result.success) {
      throw new Error(`容器載入失敗: ${result.error}`)
    }
    
    // 根據 URL 獲取容器名稱
    const containerName = this.getContainerNameFromUrl(remoteUrl)
    
    // 載入指定模組
    const globalThis_ = globalThis as any
    const container = globalThis_[containerName]
    
    if (!container) {
      throw new Error(`容器 ${containerName} 不可用`)
    }
    
    console.log(`📦 正在載入模組: ${moduleName}`)
    const factory = await container.get(moduleName)
    
    if (!factory || typeof factory !== 'function') {
      throw new Error(`模組 ${moduleName} 的 factory 無效`)
    }
    
    const module = factory()
    
    if (!module) {
      throw new Error(`模組 ${moduleName} 載入後為空`)
    }
    
    // 嘗試獲取組件，優先使用 default export
    let component = module.default || module
    
    // 如果組件是 Vue 組件對象，直接返回
    if (component && typeof component === 'object' && (component.setup || component.render || component.template)) {
      console.log(`✅ 模組 ${moduleName} 載入成功 (Vue 組件):`, component)
      return component
    }
    
    // 如果沒有找到有效組件
    if (!component) {
      throw new Error(`模組 ${moduleName} 沒有有效的組件`)
    }
    
    console.log(`✅ 模組 ${moduleName} 載入成功:`, component)
    return component
  }
  
  /**
   * 方法 2: 直接 fetch + eval
   */
  private async loadModuleFetchEval(moduleName: string, remoteUrl: string): Promise<any> {
    console.log(`🔧 使用 fetch + eval 載入模組: ${moduleName}`)
    
    // 1. Fetch remoteEntry.js
    console.log(`📥 正在 fetch: ${remoteUrl}`)
    const response = await fetch(remoteUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const scriptContent = await response.text()
    console.log(`✅ 取得腳本內容 (${scriptContent.length} 字元)`)
    
    // 2. 執行腳本
    console.log('🔧 執行 remoteEntry.js')
    eval(scriptContent)
    
    // 3. 等待容器出現
    console.log('⏳ 等待容器註冊...')
    await this.sleep(2000)
    
    const containerName = this.getContainerNameFromUrl(remoteUrl)
    const globalThis_ = globalThis as any
    const container = globalThis_[containerName]
    
    if (!container) {
      throw new Error(`容器 ${containerName} 未註冊`)
    }
    
    console.log(`✅ 找到容器 ${containerName}`)
    
    // 4. 初始化容器
    if (!container._initialized) {
      console.log('🔧 初始化容器...')
      const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
      await container.init(sharedScope)
      container._initialized = true
      console.log('✅ 容器初始化完成')
    }
    
    // 5. 載入模組
    console.log(`📦 載入 ${moduleName} 模組...`)
    const factory = await container.get(moduleName)
    const module = factory()
    const component = module.default || module
    
    console.log(`✅ fetch + eval 載入成功:`, component)
    return component
  }
  
  /**
   * 方法 3: 動態 import
   */
  private async loadModuleDynamicImport(moduleName: string, remoteUrl: string): Promise<any> {
    console.log(`🔧 使用動態 import 載入模組: ${moduleName}`)
    
    try {
      // 嘗試直接動態 import
      const module = await import(/* webpackIgnore: true */ `${remoteUrl.replace('/remoteEntry.js', '')}/${moduleName}`)
      const component = module.default || module
      
      console.log(`✅ 動態 import 載入成功:`, component)
      return component
    } catch (error) {
      throw new Error(`動態 import 失敗: ${error}`)
    }
  }
  
  /**
   * 方法 4: 手動腳本注入
   */
  private async loadModuleManualInjection(moduleName: string, remoteUrl: string): Promise<any> {
    console.log(`🔧 使用手動腳本注入載入模組: ${moduleName}`)
    
    const containerName = this.getContainerNameFromUrl(remoteUrl)
    const globalThis_ = globalThis as any
    
    // 檢查是否已有容器
    if (globalThis_[containerName]) {
      console.log(`✅ 容器 ${containerName} 已存在`)
    } else {
      // 手動載入腳本
      console.log(`📥 手動載入腳本: ${remoteUrl}`)
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = remoteUrl
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
      
      // 等待容器註冊
      await this.sleep(2000)
    }
    
    const container = globalThis_[containerName]
    if (!container) {
      throw new Error(`容器 ${containerName} 未找到`)
    }
    
    // 初始化容器
    if (!container._initialized) {
      console.log('🔧 初始化容器...')
      const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
      await container.init(sharedScope)
      container._initialized = true
    }
    
    // 載入模組
    console.log(`📦 載入 ${moduleName} 模組...`)
    const factory = await container.get(moduleName)
    const module = factory()
    const component = module.default || module
    
    console.log(`✅ 手動腳本注入載入成功:`, component)
    return component
  }

  /**
   * 方法 5: LLM 專用修復（處理 publicPath 問題）
   */
  private async loadModuleLLMFix(moduleName: string, remoteUrl: string): Promise<any> {
    console.log(`🔧 使用 LLM 專用修復載入模組: ${moduleName}`)
    
    // 檢查是否為 LLM 應用
    if (!remoteUrl.includes('localhost:3003')) {
      throw new Error('此方法僅適用於 LLM 應用')
    }
    
    const containerName = 'llm_web'
    const globalThis_ = globalThis as any
    
    // 1. 手動修復 webpack 的 publicPath
    console.log('🔧 修復 webpack publicPath...')
    const originalPublicPath = (globalThis as any).__webpack_public_path__
    if (originalPublicPath) {
      console.log(`原始 publicPath: ${originalPublicPath}`)
    }
    
    // 設置正確的 publicPath
    const correctPublicPath = 'http://localhost:3003/llm_web/'
    ;(globalThis as any).__webpack_public_path__ = correctPublicPath
    console.log(`設置 publicPath: ${correctPublicPath}`)
    
    try {
      // 2. 載入 remoteEntry.js
      console.log(`📥 載入 remoteEntry: ${remoteUrl}`)
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = remoteUrl
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
      
      // 3. 等待容器註冊
      console.log('⏳ 等待容器註冊...')
      await this.sleep(3000)
      
      const container = globalThis_[containerName]
      if (!container) {
        throw new Error(`容器 ${containerName} 未找到`)
      }
      
      console.log(`✅ 找到容器 ${containerName}`)
      
      // 4. 初始化容器
      if (!container._initialized) {
        console.log('🔧 初始化容器...')
        const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
        await container.init(sharedScope)
        container._initialized = true
        console.log('✅ 容器初始化完成')
      }
      
      // 5. 載入模組
      console.log(`📦 載入 ${moduleName} 模組...`)
      const factory = await container.get(moduleName)
      const module = factory()
      const component = module.default || module
      
      console.log(`✅ LLM 專用修復載入成功:`, component)
      return component
      
    } finally {
      // 恢復原始 publicPath
      if (originalPublicPath) {
        ;(globalThis as any).__webpack_public_path__ = originalPublicPath
        console.log(`恢復 publicPath: ${originalPublicPath}`)
      }
    }
  }
  
  /**
   * 方法 6: 強制 chunk 修復
   */
  private async loadModuleChunkFix(moduleName: string, remoteUrl: string): Promise<any> {
    console.log(`🔧 使用強制 chunk 修復載入模組: ${moduleName}`)
    
    const containerName = this.getContainerNameFromUrl(remoteUrl)
    const globalThis_ = globalThis as any
    
    // 1. 攔截並修復 chunk 載入
    console.log('🔧 設置 chunk 載入攔截器...')
    const originalImportScript = (globalThis as any).__webpack_require__?.l
    if (originalImportScript) {
      (globalThis as any).__webpack_require__.l = (url: string, done: Function, key: string, chunkId: string) => {
        console.log(`🔍 攔截 chunk 載入: ${url}`)
        
        // 修復 LLM 應用的 chunk URL
        if (url.includes('/llm_web/js/') && !url.includes('localhost:3003')) {
          const fixedUrl = url.replace('http://localhost:3000/llm_web/', 'http://localhost:3003/llm_web/')
          console.log(`🔧 修復 chunk URL: ${url} -> ${fixedUrl}`)
          url = fixedUrl
        }
        
        // 額外修復：如果 chunk URL 沒有正確的基礎路徑
        if (url.includes('/llm_web/js/') && url.startsWith('/')) {
          const fixedUrl = `http://localhost:3003${url}`
          console.log(`🔧 修復相對路徑 chunk URL: ${url} -> ${fixedUrl}`)
          url = fixedUrl
        }
        
        // 調用原始方法
        return originalImportScript.call(globalThis, url, done, key, chunkId)
      }
    }
    
    try {
      // 2. 載入 remoteEntry.js
      console.log(`📥 載入 remoteEntry: ${remoteUrl}`)
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = remoteUrl
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
      
      // 3. 等待容器註冊
      console.log('⏳ 等待容器註冊...')
      await this.sleep(3000)
      
      const container = globalThis_[containerName]
      if (!container) {
        throw new Error(`容器 ${containerName} 未找到`)
      }
      
      console.log(`✅ 找到容器 ${containerName}`)
      
      // 4. 初始化容器
      if (!container._initialized) {
        console.log('🔧 初始化容器...')
        const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
        await container.init(sharedScope)
        container._initialized = true
        console.log('✅ 容器初始化完成')
      }
      
      // 5. 載入模組
      console.log(`📦 載入 ${moduleName} 模組...`)
      const factory = await container.get(moduleName)
      const module = factory()
      const component = module.default || module
      
      console.log(`✅ 強制 chunk 修復載入成功:`, component)
      return component
      
    } finally {
      // 恢復原始 chunk 載入方法
      if (originalImportScript) {
        (globalThis as any).__webpack_require__.l = originalImportScript
        console.log('✅ 恢復原始 chunk 載入方法')
      }
    }
  }
  
  /**
   * 方法 7: LLM 專用強制修復
   */
  private async loadModuleLLMForceFix(moduleName: string, remoteUrl: string): Promise<any> {
    console.log(`🔧 使用 LLM 專用強制修復載入模組: ${moduleName}`)
    
    // 檢查是否為 LLM 應用
    if (!remoteUrl.includes('localhost:3003')) {
      throw new Error('此方法僅適用於 LLM 應用')
    }
    
    const containerName = 'llm_web'
    const globalThis_ = globalThis as any
    
    // 1. 完全重置 webpack 環境
    console.log('🔧 重置 webpack 環境...')
    
    // 設置正確的 publicPath
    const correctPublicPath = 'http://localhost:3003/llm_web/'
    ;(globalThis as any).__webpack_public_path__ = correctPublicPath
    console.log(`設置 publicPath: ${correctPublicPath}`)
    
    // 2. 強制攔截所有 chunk 載入
    const originalImportScript = (globalThis as any).__webpack_require__?.l
    if (originalImportScript) {
      (globalThis as any).__webpack_require__.l = (url: string, done: Function, key: string, chunkId: string) => {
        console.log(`🔍 強制攔截 chunk 載入: ${url}`)
        
        // 強制修復所有 LLM 相關的 chunk URL
        if (url.includes('llm_web') || url.includes('333.') || url.includes('agent')) {
          let fixedUrl = url
          
          // 修復各種可能的錯誤 URL
          if (url.includes('http://localhost:3000/llm_web/')) {
            fixedUrl = url.replace('http://localhost:3000/llm_web/', 'http://localhost:3003/llm_web/')
          } else if (url.startsWith('/llm_web/')) {
            fixedUrl = `http://localhost:3003${url}`
          } else if (url.startsWith('/js/')) {
            fixedUrl = `http://localhost:3003/llm_web${url}`
          } else if (!url.includes('localhost:3003')) {
            fixedUrl = `http://localhost:3003/llm_web/js/${url.split('/').pop()}`
          }
          
          console.log(`🔧 強制修復 chunk URL: ${url} -> ${fixedUrl}`)
          url = fixedUrl
        }
        
        // 調用原始方法
        return originalImportScript.call(globalThis, url, done, key, chunkId)
      }
    }
    
    try {
      // 3. 清除可能存在的舊容器
      if (globalThis_[containerName]) {
        console.log('🧹 清除舊容器...')
        try {
          delete globalThis_[containerName]
        } catch (error) {
          console.log('⚠️ 無法刪除容器，嘗試重置...')
          globalThis_[containerName] = null
        }
      }
      
      // 4. 重新載入 remoteEntry.js
      console.log(`📥 重新載入 remoteEntry: ${remoteUrl}`)
      
      // 移除可能存在的舊腳本
      const existingScripts = document.querySelectorAll(`script[src="${remoteUrl}"]`)
      existingScripts.forEach(script => script.remove())
      
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = remoteUrl
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
      
      // 5. 等待容器註冊
      console.log('⏳ 等待容器註冊...')
      await this.sleep(5000)
      
      const container = globalThis_[containerName]
      if (!container) {
        throw new Error(`容器 ${containerName} 未找到`)
      }
      
      console.log(`✅ 找到容器 ${containerName}`)
      
      // 6. 初始化容器
      if (!container._initialized) {
        console.log('🔧 初始化容器...')
        const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
        await container.init(sharedScope)
        container._initialized = true
        console.log('✅ 容器初始化完成')
      }
      
      // 7. 載入模組
      console.log(`📦 載入 ${moduleName} 模組...`)
      const factory = await container.get(moduleName)
      const module = factory()
      const component = module.default || module
      
      console.log(`✅ LLM 專用強制修復載入成功:`, component)
      return component
      
    } finally {
      // 恢復原始 chunk 載入方法
      if (originalImportScript) {
        (globalThis as any).__webpack_require__.l = originalImportScript
        console.log('✅ 恢復原始 chunk 載入方法')
      }
    }
  }
  
  /**
   * 方法 8: 手動 chunk 載入
   */
  private async loadModuleManualChunk(moduleName: string, remoteUrl: string): Promise<any> {
    console.log(`🔧 使用手動 chunk 載入模組: ${moduleName}`)
    
    // 檢查是否為 LLM 應用
    if (!remoteUrl.includes('localhost:3003')) {
      throw new Error('此方法僅適用於 LLM 應用')
    }
    
    const containerName = 'llm_web'
    const globalThis_ = globalThis as any
    let originalImportScript: any = null
    
    try {
      // 1. 手動載入 remoteEntry.js
      console.log(`📥 手動載入 remoteEntry: ${remoteUrl}`)
      
      // 移除可能存在的舊腳本
      const existingScripts = document.querySelectorAll(`script[src="${remoteUrl}"]`)
      existingScripts.forEach(script => script.remove())
      
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = remoteUrl
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
      
      // 2. 等待容器註冊
      console.log('⏳ 等待容器註冊...')
      await this.sleep(3000)
      
      const container = globalThis_[containerName]
      if (!container) {
        throw new Error(`容器 ${containerName} 未找到`)
      }
      
      console.log(`✅ 找到容器 ${containerName}`)
      
      // 3. 初始化容器
      if (!container._initialized) {
        console.log('🔧 初始化容器...')
        const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
        await container.init(sharedScope)
        container._initialized = true
        console.log('✅ 容器初始化完成')
      }
      
      // 4. 手動攔截並修復 chunk 載入
      console.log('🔧 設置手動 chunk 攔截器...')
      if ((globalThis as any).__webpack_require__?.l) {
        originalImportScript = (globalThis as any).__webpack_require__.l
        (globalThis as any).__webpack_require__.l = (url: string, done: Function, key: string, chunkId: string) => {
          console.log(`🔍 手動攔截 chunk 載入: ${url}`)
          
          // 強制修復所有 LLM 相關的 chunk URL
          if (url.includes('llm_web') || url.includes('333.') || url.includes('31.') || url.includes('agent') || url.includes('promptList')) {
            let fixedUrl = url
            
            // 修復各種可能的錯誤 URL
            if (url.includes('http://localhost:3000/llm_web/')) {
              fixedUrl = url.replace('http://localhost:3000/llm_web/', 'http://localhost:3003/llm_web/')
            } else if (url.startsWith('/llm_web/')) {
              fixedUrl = `http://localhost:3003${url}`
            } else if (url.startsWith('/js/')) {
              fixedUrl = `http://localhost:3003/llm_web${url}`
            } else if (!url.includes('localhost:3003')) {
              // 如果是相對路徑或錯誤的絕對路徑
              if (url.includes('js/')) {
                fixedUrl = `http://localhost:3003/llm_web/${url}`
              } else {
                fixedUrl = `http://localhost:3003/llm_web/js/${url.split('/').pop()}`
              }
            }
            
            console.log(`🔧 手動修復 chunk URL: ${url} -> ${fixedUrl}`)
            url = fixedUrl
          }
          
          // 調用原始方法
          return originalImportScript.call(globalThis, url, done, key, chunkId)
        }
      }
      
      // 5. 載入模組
      console.log(`📦 載入 ${moduleName} 模組...`)
      const factory = await container.get(moduleName)
      const module = factory()
      const component = module.default || module
      
      console.log(`✅ 手動 chunk 載入成功:`, component)
      return component
      
    } finally {
      // 恢復原始 chunk 載入方法
      if (originalImportScript) {
        (globalThis as any).__webpack_require__.l = originalImportScript
        console.log('✅ 恢復原始 chunk 載入方法')
      }
    }
  }
  
  /**
   * 方法 9: 直接修復 webpack 配置
   */
  private async loadModuleWebpackFix(moduleName: string, remoteUrl: string): Promise<any> {
    console.log(`🔧 使用直接修復 webpack 配置載入模組: ${moduleName}`)
    
    // 檢查是否為 LLM 應用
    if (!remoteUrl.includes('localhost:3003')) {
      throw new Error('此方法僅適用於 LLM 應用')
    }
    
    const containerName = 'llm_web'
    const globalThis_ = globalThis as any
    let originalPublicPath: any = null
    let originalImportScript: any = null
    
    try {
      // 1. 直接修改 webpack 的 publicPath
      console.log('🔧 直接修改 webpack publicPath...')
      originalPublicPath = (globalThis as any).__webpack_public_path__
      ;(globalThis as any).__webpack_public_path__ = 'http://localhost:3003/llm_web/'
      console.log(`設置 publicPath: http://localhost:3003/llm_web/`)
      
      // 2. 直接修改 webpack 的 chunk 載入函數
      console.log('🔧 直接修改 webpack chunk 載入函數...')
      const webpackRequire = (globalThis as any).__webpack_require__
      
      if (webpackRequire && webpackRequire.l) {
        originalImportScript = webpackRequire.l
        webpackRequire.l = (url: string, done: Function, key: string, chunkId: string) => {
          console.log(`🔍 直接攔截 chunk 載入: ${url}`)
          
          // 強制修復所有 LLM 相關的 chunk URL
          if (url.includes('llm_web') || url.includes('333.') || url.includes('31.') || url.includes('agent') || url.includes('promptList')) {
            let fixedUrl = url
            
            // 修復各種可能的錯誤 URL
            if (url.includes('http://localhost:3000/llm_web/')) {
              fixedUrl = url.replace('http://localhost:3000/llm_web/', 'http://localhost:3003/llm_web/')
            } else if (url.startsWith('/llm_web/')) {
              fixedUrl = `http://localhost:3003${url}`
            } else if (url.startsWith('/js/')) {
              fixedUrl = `http://localhost:3003/llm_web${url}`
            } else if (!url.includes('localhost:3003')) {
              // 如果是相對路徑或錯誤的絕對路徑
              if (url.includes('js/')) {
                fixedUrl = `http://localhost:3003/llm_web/${url}`
              } else {
                fixedUrl = `http://localhost:3003/llm_web/js/${url.split('/').pop()}`
              }
            }
            
            console.log(`🔧 直接修復 chunk URL: ${url} -> ${fixedUrl}`)
            url = fixedUrl
          }
          
          // 調用原始方法
          return originalImportScript.call(globalThis, url, done, key, chunkId)
        }
      }
      
      // 3. 載入 remoteEntry.js
      console.log(`📥 載入 remoteEntry: ${remoteUrl}`)
      
      // 移除可能存在的舊腳本
      const existingScripts = document.querySelectorAll(`script[src="${remoteUrl}"]`)
      existingScripts.forEach(script => script.remove())
      
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = remoteUrl
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
      
      // 4. 等待容器註冊
      console.log('⏳ 等待容器註冊...')
      await this.sleep(3000)
      
      const container = globalThis_[containerName]
      if (!container) {
        throw new Error(`容器 ${containerName} 未找到`)
      }
      
      console.log(`✅ 找到容器 ${containerName}`)
      
      // 5. 初始化容器
      if (!container._initialized) {
        console.log('🔧 初始化容器...')
        const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
        await container.init(sharedScope)
        container._initialized = true
        console.log('✅ 容器初始化完成')
      }
      
      // 6. 載入模組
      console.log(`📦 載入 ${moduleName} 模組...`)
      const factory = await container.get(moduleName)
      const module = factory()
      const component = module.default || module
      
      console.log(`✅ 直接修復 webpack 配置載入成功:`, component)
      return component
      
    } finally {
      // 恢復原始配置
      if (originalPublicPath) {
        ;(globalThis as any).__webpack_public_path__ = originalPublicPath
        console.log(`恢復 publicPath: ${originalPublicPath}`)
      }
      
      if (originalImportScript) {
        const webpackRequire = (globalThis as any).__webpack_require__
        if (webpackRequire) {
          webpackRequire.l = originalImportScript
          console.log('✅ 恢復原始 chunk 載入方法')
        }
      }
    }
  }
  
  /**
   * 確保 chunk 攔截器已設置
   */
  private ensureChunkInterceptor() {
    console.log('🔧 確保 chunk 攔截器已設置...')
    
    const webpackRequire = (globalThis as any).__webpack_require__
    if (webpackRequire && webpackRequire.l) {
      // 檢查是否已經設置了我們的攔截器
      const currentInterceptor = webpackRequire.l.toString()
      if (currentInterceptor.includes('🔍 攔截 chunk 載入')) {
        console.log('✅ chunk 攔截器已存在')
        return
      }
      
      console.log('🔧 設置 chunk 攔截器...')
      const originalImportScript = webpackRequire.l
      webpackRequire.l = (url: string, done: Function, key: string, chunkId: string) => {
        console.log(`🔍 攔截 chunk 載入: ${url}`)
        
        // 強制修復所有 LLM 相關的 chunk URL
        if (url.includes('llm_web') || url.includes('333.') || url.includes('31.') || url.includes('agent') || url.includes('promptList')) {
          let fixedUrl = url
          
          // 修復各種可能的錯誤 URL
          if (url.includes('http://localhost:3000/llm_web/')) {
            fixedUrl = url.replace('http://localhost:3000/llm_web/', 'http://localhost:3003/llm_web/')
          } else if (url.startsWith('/llm_web/')) {
            fixedUrl = `http://localhost:3003${url}`
          } else if (url.startsWith('/js/')) {
            fixedUrl = `http://localhost:3003/llm_web${url}`
          } else if (!url.includes('localhost:3003')) {
            // 如果是相對路徑或錯誤的絕對路徑
            if (url.includes('js/')) {
              fixedUrl = `http://localhost:3003/llm_web/${url}`
            } else {
              fixedUrl = `http://localhost:3003/llm_web/js/${url.split('/').pop()}`
            }
          }
          
          console.log(`🔧 強制修復 chunk URL: ${url} -> ${fixedUrl}`)
          url = fixedUrl
        }
        
        // 調用原始方法
        return originalImportScript.call(globalThis, url, done, key, chunkId)
      }
      console.log('✅ chunk 攔截器設置完成')
    } else {
      console.log('⚠️ webpack require.l 不可用，無法設置攔截器')
    }
  }
  
  /**
   * 只載入容器，不載入特定組件
   */
  async loadContainerOnly(remoteUrl: string = 'http://localhost:3001/workflow/remoteEntry.js'): Promise<WorkingLoadResult> {
    console.log('🧠 開始載入容器...')
    
    try {
      // 根據 URL 判斷容器名稱
      const containerName = this.getContainerNameFromUrl(remoteUrl)
      console.log(`🔍 檢測到容器名稱: ${containerName}`)
      
      // 使用 SystemJS 風格載入
      console.log('🚀 使用 SystemJS 風格載入 Remote（已驗證方法）')
      console.log(`📦 System.import: ${remoteUrl}`)
      
      const globalThis_ = globalThis as any
      
      // 檢查腳本是否已載入
      const existingScript = document.querySelector(`script[src="${remoteUrl}"]`)
      if (existingScript) {
        console.log('✅ 腳本已存在，檢查容器...')
        const container = globalThis_[containerName]
        if (container) {
          console.log(`✅ 容器 ${containerName} 已存在，跳過載入`)
          return {
            success: true,
            component: null, // 不載入組件
            method: 'systemjs-style'
          }
        }
      }
      
      // 載入腳本
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = remoteUrl
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
      
      console.log('✅ 腳本載入完成')
      
      // 等待容器註冊
      await this.sleep(1000)
      
      const container = globalThis_[containerName]
      if (!container) {
        // 嘗試從 window 對象獲取
        const window_ = window as any
        if (window_[containerName]) {
          globalThis_[containerName] = window_[containerName]
        } else {
          throw new Error(`容器 ${containerName} 未找到`)
        }
      }
      
      console.log(`✅ 找到 ${containerName} 容器`)
      
      // 初始化容器
      console.log('🔧 初始化容器...')
      const shareScope = globalThis_.__webpack_share_scopes__?.default || {}
      await container.init(shareScope)
      console.log('✅ 容器初始化完成')
      
      return {
        success: true,
        component: null, // 不載入組件
        method: 'systemjs-style'
      }
      
    } catch (error) {
      console.error('❌ 容器載入失敗:', error)
      return {
        success: false,
        method: 'systemjs-style',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }
  
  /**
   * 根據 URL 獲取容器名稱
   */
  private getContainerNameFromUrl(remoteUrl: string): string {
    if (remoteUrl.includes('localhost:3001')) {
      return 'workflow'
    } else if (remoteUrl.includes('localhost:3003')) {
      return 'llm_web'
    } else {
      // 預設返回 workflow
      return 'workflow'
    }
  }
  
  /**
   * 延遲函數
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 全域實例
export const workingRemoteLoader = new WorkingRemoteLoader()
