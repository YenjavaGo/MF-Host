// 動態導入 bootstrap 以避免共享模組的 eager consumption 問題

// 初始化 Module Federation
async function initModuleFederation() {
  console.log('🚀 開始初始化 Module Federation...')
  
  try {
    // 等待 webpack 運行時載入
    let retries = 10
    while (retries > 0 && typeof (globalThis as any).__webpack_init_sharing__ === 'undefined') {
      console.log(`⏳ 等待 webpack 運行時... (剩餘重試: ${retries})`)
      await new Promise(resolve => setTimeout(resolve, 100))
      retries--
    }
    
    // 檢查運行時是否可用
    if (typeof (globalThis as any).__webpack_init_sharing__ !== 'undefined') {
      console.log('✅ webpack 運行時已可用，初始化共享作用域...')
      await (globalThis as any).__webpack_init_sharing__('default')
      console.log('✅ 共享作用域初始化完成')
    } else {
      console.warn('⚠️ webpack 運行時不可用，將使用備用方案')
    }
    
    // 載入 bootstrap
    console.log('📦 載入應用 bootstrap...')
    await import('./bootstrap')
    console.log('✅ 應用初始化完成')
    
  } catch (error) {
    console.error('❌ Module Federation 初始化失敗:', error)
    // 即使失敗也要載入應用
    await import('./bootstrap')
  }
}

initModuleFederation().catch(console.error)
