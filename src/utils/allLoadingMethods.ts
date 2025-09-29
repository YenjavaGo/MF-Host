/**
 * 所有載入方法測試器
 * 測試多種不同的 Remote 載入方式
 */

export interface LoadMethodResult {
  method: string
  success: boolean
  error?: string
  component?: any
  logs: string[]
}

export class AllLoadingMethods {
  private logs: string[] = []
  
  private log(message: string) {
    console.log(message)
    this.logs.push(message)
  }
  
  private clearLogs() {
    this.logs = []
  }
  
  /**
   * 方法 1: SystemJS 風格載入
   */
  async method1_SystemJS(remoteUrl: string): Promise<LoadMethodResult> {
    this.clearLogs()
    this.log('🔄 方法 1: SystemJS 風格載入')
    
    try {
      const System = {
        import: async (url: string) => {
          this.log(`📦 System.import: ${url}`)
          return new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[src="${url}"]`)
            if (existingScript) {
              this.log('✅ 腳本已存在')
              const globalThis_ = globalThis as any
              if (globalThis_.workflow) {
                resolve(globalThis_.workflow)
                return
              }
            }
            
            const script = document.createElement('script')
            script.src = url
            script.onload = () => {
              this.log('✅ 腳本載入完成')
              setTimeout(() => {
                const globalThis_ = globalThis as any
                if (globalThis_.workflow) {
                  resolve(globalThis_.workflow)
                } else {
                  reject(new Error('容器未註冊'))
                }
              }, 200)
            }
            script.onerror = reject
            document.head.appendChild(script)
          })
        }
      }
      
      const container = await System.import(remoteUrl) as any
      this.log('✅ 容器載入成功')
      
      if (!container._initialized) {
        const globalThis_ = globalThis as any
        const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
        await container.init(sharedScope)
        container._initialized = true
        this.log('✅ 容器初始化完成')
      }
      
      const factory = await container.get('./App')
      const module = factory()
      const component = module.default || module
      
      this.log('✅ 方法 1 成功')
      return {
        method: 'SystemJS',
        success: true,
        component,
        logs: [...this.logs]
      }
      
    } catch (error) {
      this.log(`❌ 方法 1 失敗: ${error}`)
      return {
        method: 'SystemJS',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs: [...this.logs]
      }
    }
  }
  
  /**
   * 方法 2: 直接 fetch + eval
   */
  async method2_FetchEval(remoteUrl: string): Promise<LoadMethodResult> {
    this.clearLogs()
    this.log('🔄 方法 2: fetch + eval')
    
    try {
      this.log(`📥 Fetch: ${remoteUrl}`)
      const response = await fetch(remoteUrl)
      const content = await response.text()
      this.log(`✅ 取得內容 (${content.length} 字元)`)
      
      this.log('🔧 執行腳本')
      eval(content)
      
      await this.sleep(300)
      const globalThis_ = globalThis as any
      const container = globalThis_.workflow
      
      if (!container) {
        throw new Error('容器未註冊')
      }
      
      if (!container._initialized) {
        const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
        await container.init(sharedScope)
        container._initialized = true
        this.log('✅ 容器初始化完成')
      }
      
      const factory = await container.get('./App')
      const module = factory()
      const component = module.default || module
      
      this.log('✅ 方法 2 成功')
      return {
        method: 'fetch-eval',
        success: true,
        component,
        logs: [...this.logs]
      }
      
    } catch (error) {
      this.log(`❌ 方法 2 失敗: ${error}`)
      return {
        method: 'fetch-eval',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs: [...this.logs]
      }
    }
  }
  
  /**
   * 方法 3: webpack import
   */
  async method3_WebpackImport(): Promise<LoadMethodResult> {
    this.clearLogs()
    this.log('🔄 方法 3: webpack import')
    
    try {
      const possiblePaths = [
        'workflow/App',
        'workflow/FlowManager',
        'workflow/CustomNode',
        'workflow/flowManager'
      ]
      
      for (const path of possiblePaths) {
        try {
          this.log(`🧪 嘗試: ${path}`)
          // 使用 eval 包裝動態 import 以避免 webpack 警告
          const module = await eval(`import(/* webpackChunkName: "remote-workflow" */ '${path}')`)
          const component = module.default || module
          
          if (component) {
            this.log(`✅ 方法 3 成功: ${path}`)
            return {
              method: 'webpack-import',
              success: true,
              component,
              logs: [...this.logs]
            }
          }
        } catch (error) {
          this.log(`❌ ${path} 失敗: ${error}`)
        }
      }
      
      throw new Error('所有 webpack import 路徑都失敗')
      
    } catch (error) {
      this.log(`❌ 方法 3 失敗: ${error}`)
      return {
        method: 'webpack-import',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs: [...this.logs]
      }
    }
  }
  
  /**
   * 方法 4: 動態腳本載入
   */
  async method4_DynamicScript(remoteUrl: string): Promise<LoadMethodResult> {
    this.clearLogs()
    this.log('🔄 方法 4: 動態腳本載入')
    
    try {
      await this.loadScript(remoteUrl)
      this.log('✅ 腳本載入完成')
      
      const container = await this.waitForContainer('workflow', 3000)
      this.log('✅ 找到容器')
      
      if (!container._initialized) {
        const globalThis_ = globalThis as any
        const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
        await container.init(sharedScope)
        container._initialized = true
        this.log('✅ 容器初始化完成')
      }
      
      const factory = await container.get('./App')
      const module = factory()
      const component = module.default || module
      
      this.log('✅ 方法 4 成功')
      return {
        method: 'dynamic-script',
        success: true,
        component,
        logs: [...this.logs]
      }
      
    } catch (error) {
      this.log(`❌ 方法 4 失敗: ${error}`)
      return {
        method: 'dynamic-script',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs: [...this.logs]
      }
    }
  }
  
  /**
   * 方法 5: 全域變數檢查載入
   */
  async method5_GlobalCheck(remoteUrl: string): Promise<LoadMethodResult> {
    this.clearLogs()
    this.log('🔄 方法 5: 全域變數檢查載入')
    
    try {
      // 先載入腳本
      await this.loadScript(remoteUrl)
      this.log('✅ 腳本載入完成')
      
      // 檢查所有可能的全域變數
      const globalThis_ = globalThis as any
      const possibleNames = ['workflow', 'vue_flow_app', 'simple_remote', 'mf_remote']
      let foundContainer = null
      let foundName = ''
      
      for (const name of possibleNames) {
        if (globalThis_[name] && 
            typeof globalThis_[name] === 'object' &&
            typeof globalThis_[name].init === 'function' &&
            typeof globalThis_[name].get === 'function') {
          foundContainer = globalThis_[name]
          foundName = name
          this.log(`✅ 找到容器: ${name}`)
          break
        }
      }
      
      if (!foundContainer) {
        throw new Error('未找到有效容器')
      }
      
      if (!foundContainer._initialized) {
        const sharedScope = globalThis_.__webpack_share_scopes__?.default || {}
        await foundContainer.init(sharedScope)
        foundContainer._initialized = true
        this.log('✅ 容器初始化完成')
      }
      
      // 嘗試不同的模組路徑
      const modulePaths = ['./App', './FlowManager', './CustomNode', './main', './index']
      let component = null
      
      for (const modulePath of modulePaths) {
        try {
          this.log(`🧪 嘗試模組: ${modulePath}`)
          const factory = await foundContainer.get(modulePath)
          const module = factory()
          component = module.default || module
          if (component) {
            this.log(`✅ 成功載入模組: ${modulePath}`)
            break
          }
        } catch (error) {
          this.log(`❌ 模組 ${modulePath} 失敗`)
        }
      }
      
      if (!component) {
        throw new Error('未找到有效組件')
      }
      
      this.log(`✅ 方法 5 成功 (容器: ${foundName})`)
      return {
        method: 'global-check',
        success: true,
        component,
        logs: [...this.logs]
      }
      
    } catch (error) {
      this.log(`❌ 方法 5 失敗: ${error}`)
      return {
        method: 'global-check',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs: [...this.logs]
      }
    }
  }
  
  /**
   * 測試所有方法
   */
  async testAllMethods(remoteUrl: string = 'http://localhost:3001/workflow/remoteEntry.js'): Promise<LoadMethodResult[]> {
    console.log('🚀 開始測試所有載入方法...')
    
    const results: LoadMethodResult[] = []
    
    // 方法 1: SystemJS
    results.push(await this.method1_SystemJS(remoteUrl))
    
    // 方法 2: fetch + eval
    results.push(await this.method2_FetchEval(remoteUrl))
    
    // 方法 3: webpack import
    results.push(await this.method3_WebpackImport())
    
    // 方法 4: 動態腳本
    results.push(await this.method4_DynamicScript(remoteUrl))
    
    // 方法 5: 全域變數檢查
    results.push(await this.method5_GlobalCheck(remoteUrl))
    
    // 總結
    const successful = results.filter(r => r.success)
    console.log(`📊 測試結果: ${successful.length}/${results.length} 成功`)
    
    // 詳細日誌
    results.forEach((result, index) => {
      console.log(`\n=== 方法 ${index + 1} (${result.method}) ===`)
      console.log(`結果: ${result.success ? '✅ 成功' : '❌ 失敗'}`)
      if (result.error) {
        console.log(`錯誤: ${result.error}`)
      }
      console.log('日誌:', result.logs)
    })
    
    return results
  }
  
  /**
   * 載入腳本
   */
  private async loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`)
      if (existing) {
        resolve()
        return
      }
      
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = () => resolve()
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  
  /**
   * 等待容器出現
   */
  private async waitForContainer(name: string, timeout: number): Promise<any> {
    const start = Date.now()
    
    while (Date.now() - start < timeout) {
      const globalThis_ = globalThis as any
      const container = globalThis_[name]
      
      if (container && 
          typeof container.init === 'function' &&
          typeof container.get === 'function') {
        return container
      }
      
      await this.sleep(100)
    }
    
    throw new Error(`等待容器 ${name} 超時`)
  }
  
  /**
   * 延遲函數
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 全域實例
export const allLoadingMethods = new AllLoadingMethods()
