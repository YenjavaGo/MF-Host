// 修復 LLM 應用的 chunk 載入問題
function fixLLMChunkLoading() {
  console.log('🔧 設置 LLM chunk 載入修復...')
  
  // 等待 webpack 運行時準備好
  const setupInterceptor = () => {
    const webpackRequire = (globalThis as any).__webpack_require__
    if (webpackRequire && webpackRequire.l) {
      console.log('✅ 找到 webpack require.l，設置攔截器')
      
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
      console.log('✅ LLM chunk 載入修復已設置')
      return true
    }
    return false
  }
  
  // 立即嘗試設置
  if (!setupInterceptor()) {
    console.log('⏳ webpack 運行時未準備好，等待設置...')
    // 如果 webpack 運行時還沒準備好，等待一下再試
    setTimeout(() => {
      if (!setupInterceptor()) {
        console.log('⚠️ 無法設置 chunk 攔截器，將在載入時動態設置')
      }
    }, 1000)
  }
}

// 簡化的 Module Federation 初始化
async function initApp() {
  console.log('🚀 開始初始化應用...')
  
  // 先設置 chunk 載入修復
  fixLLMChunkLoading()
  
  try {
    // 檢查是否在生產環境
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (isProduction) {
      // 生產環境：直接載入 bootstrap
      console.log('📦 生產環境：直接載入應用...')
      await import('./bootstrap')
    } else {
      // 開發環境：等待 webpack 運行時
      console.log('📦 開發環境：等待 webpack 運行時...')
      
      let retries = 5
      while (retries > 0 && typeof (globalThis as any).__webpack_init_sharing__ === 'undefined') {
        console.log(`⏳ 等待 webpack 運行時... (剩餘重試: ${retries})`)
        await new Promise(resolve => setTimeout(resolve, 200))
        retries--
      }
      
      if (typeof (globalThis as any).__webpack_init_sharing__ !== 'undefined') {
        console.log('✅ 初始化共享作用域...')
        await (globalThis as any).__webpack_init_sharing__('default')
      }
      
      await import('./bootstrap')
    }
    
    console.log('✅ 應用初始化完成')
    
  } catch (error) {
    console.error('❌ 應用初始化失敗:', error)
    // 備用方案：直接載入 bootstrap
    try {
      await import('./bootstrap')
    } catch (fallbackError) {
      console.error('❌ 備用方案也失敗:', fallbackError)
    }
  }
}

initApp().catch(console.error)
