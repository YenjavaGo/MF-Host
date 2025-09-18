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
  async loadWithSystemJS(remoteUrl: string = 'http://localhost:3001/remoteEntry.js'): Promise<WorkingLoadResult> {
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
      
      // 載入組件
      console.log('📦 載入 ./App 組件...')
      const factory = await container.get('./App')
      const module = factory()
      const component = module.default || module
      
      console.log('✅ SystemJS 載入成功')
      return {
        success: true,
        component,
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
  async loadWithFetchEval(remoteUrl: string = 'http://localhost:3001/remoteEntry.js'): Promise<WorkingLoadResult> {
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
  async smartLoad(remoteUrl: string = 'http://localhost:3001/remoteEntry.js'): Promise<WorkingLoadResult> {
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
   * 載入特定模組
   */
  async loadModule(moduleName: string = './App', remoteUrl: string = 'http://localhost:3001/remoteEntry.js'): Promise<any> {
    console.log(`📦 載入特定模組: ${moduleName}`)
    
    // 先確保容器已載入
    const result = await this.smartLoad(remoteUrl)
    
    if (!result.success) {
      throw new Error(`容器載入失敗: ${result.error}`)
    }
    
    // 載入指定模組
    const globalThis_ = globalThis as any
    const container = globalThis_.workflow
    
    if (!container) {
      throw new Error('容器不可用')
    }
    
    try {
      const factory = await container.get(moduleName)
      const module = factory()
      const component = module.default || module
      
      console.log(`✅ 模組 ${moduleName} 載入成功`)
      return component
    } catch (error) {
      console.error(`❌ 模組 ${moduleName} 載入失敗:`, error)
      throw error
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
