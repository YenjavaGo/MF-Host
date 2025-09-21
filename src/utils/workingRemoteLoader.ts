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
    
    // 先確保容器已載入（但不載入特定組件）
    const result = await this.loadContainerOnly(remoteUrl)
    
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
    } catch (error) {
      console.error(`❌ 模組 ${moduleName} 載入失敗:`, error)
      throw error
    }
  }

  /**
   * 只載入容器，不載入特定組件
   */
  async loadContainerOnly(remoteUrl: string = 'http://localhost:3001/remoteEntry.js'): Promise<WorkingLoadResult> {
    console.log('🧠 開始載入容器...')
    
    try {
      // 使用 SystemJS 風格載入
      console.log('🚀 使用 SystemJS 風格載入 Remote（已驗證方法）')
      console.log(`📦 System.import: ${remoteUrl}`)
      
      const globalThis_ = globalThis as any
      
      // 檢查腳本是否已載入
      const existingScript = document.querySelector(`script[src="${remoteUrl}"]`)
      if (existingScript) {
        console.log('✅ 腳本已存在，檢查容器...')
        const container = globalThis_.workflow
        if (container) {
          console.log('✅ 容器已存在，跳過載入')
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
      
      const container = globalThis_.workflow
      if (!container) {
        // 嘗試從 window 對象獲取
        const window_ = window as any
        if (window_.workflow) {
          globalThis_.workflow = window_.workflow
        } else {
          throw new Error('容器未找到')
        }
      }
      
      console.log('✅ 找到 workflow 容器')
      
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
   * 延遲函數
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 全域實例
export const workingRemoteLoader = new WorkingRemoteLoader()
