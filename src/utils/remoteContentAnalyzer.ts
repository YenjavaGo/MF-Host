/**
 * Remote 內容分析器
 * 分析 remoteEntry.js 的內容和結構
 */

export interface RemoteAnalysis {
  isAccessible: boolean
  contentLength: number
  hasWebpackRuntime: boolean
  hasContainerName: boolean
  containerName?: string
  hasModuleFederation: boolean
  hasExposes: boolean
  exposedModules: string[]
  hasInit: boolean
  hasGet: boolean
  errors: string[]
  warnings: string[]
  content?: string
}

export class RemoteContentAnalyzer {
  
  /**
   * 分析 Remote 入口檔案
   */
  async analyzeRemoteEntry(url: string): Promise<RemoteAnalysis> {
    console.log(`🔍 分析 Remote 入口: ${url}`)
    
    const analysis: RemoteAnalysis = {
      isAccessible: false,
      contentLength: 0,
      hasWebpackRuntime: false,
      hasContainerName: false,
      hasModuleFederation: false,
      hasExposes: false,
      exposedModules: [],
      hasInit: false,
      hasGet: false,
      errors: [],
      warnings: []
    }
    
    try {
      // 1. 檢查可訪問性
      console.log('📥 正在 fetch remoteEntry.js...')
      const response = await fetch(url)
      
      if (!response.ok) {
        analysis.errors.push(`HTTP ${response.status}: ${response.statusText}`)
        return analysis
      }
      
      analysis.isAccessible = true
      
      // 2. 取得內容
      const content = await response.text()
      analysis.contentLength = content.length
      analysis.content = content
      
      console.log(`✅ 成功取得內容 (${content.length} 字元)`)
      
      // 3. 基本檢查
      if (content.length < 100) {
        analysis.errors.push('內容太短，可能不是有效的 remoteEntry.js')
        return analysis
      }
      
      // 4. 檢查 webpack 運行時
      analysis.hasWebpackRuntime = content.includes('__webpack_require__') || content.includes('webpackChunk')
      if (!analysis.hasWebpackRuntime) {
        analysis.warnings.push('未找到 webpack 運行時標記')
      }
      
      // 5. 檢查 Module Federation
      analysis.hasModuleFederation = content.includes('container') || content.includes('federation')
      if (!analysis.hasModuleFederation) {
        analysis.warnings.push('未找到 Module Federation 標記')
      }
      
      // 6. 檢查容器名稱
      const containerMatches = [
        /var\s+(\w+)\s*[;=]/g,
        /window\.(\w+)\s*=/g,
        /globalThis\.(\w+)\s*=/g,
        /"(\w+)":\s*\{[^}]*init/g
      ]
      
      for (const regex of containerMatches) {
        let match
        while ((match = regex.exec(content)) !== null) {
          const name = match[1]
          if (name && name !== '__webpack_require__' && name.length > 2) {
            analysis.containerName = name
            analysis.hasContainerName = true
            console.log(`🎯 找到可能的容器名稱: ${name}`)
            break
          }
        }
        if (analysis.hasContainerName) break
      }
      
      // 7. 檢查 init 和 get 方法
      analysis.hasInit = content.includes('init') && (content.includes('function') || content.includes('=>'))
      analysis.hasGet = content.includes('get') && (content.includes('function') || content.includes('=>'))
      
      // 8. 檢查暴露的模組
      const exposeMatches = content.match(/"\.\/[^"]+"/g)
      if (exposeMatches) {
        analysis.exposedModules = exposeMatches.map(m => m.replace(/"/g, ''))
        analysis.hasExposes = analysis.exposedModules.length > 0
      }
      
      // 9. 詳細日誌
      console.log('📋 分析結果:')
      console.log(`  - 可訪問: ${analysis.isAccessible}`)
      console.log(`  - 內容長度: ${analysis.contentLength}`)
      console.log(`  - Webpack 運行時: ${analysis.hasWebpackRuntime}`)
      console.log(`  - Module Federation: ${analysis.hasModuleFederation}`)
      console.log(`  - 容器名稱: ${analysis.containerName || '未找到'}`)
      console.log(`  - init 方法: ${analysis.hasInit}`)
      console.log(`  - get 方法: ${analysis.hasGet}`)
      console.log(`  - 暴露模組: ${analysis.exposedModules.join(', ') || '無'}`)
      
      return analysis
      
    } catch (error) {
      console.error('❌ 分析失敗:', error)
      analysis.errors.push(error instanceof Error ? error.message : String(error))
      return analysis
    }
  }
  
  /**
   * 檢查 Remote 應用狀態
   */
  async checkRemoteStatus(baseUrl: string): Promise<{
    remoteEntryOk: boolean
    indexHtmlOk: boolean
    remoteAppRunning: boolean
    suggestions: string[]
  }> {
    console.log(`🔍 檢查 Remote 應用狀態: ${baseUrl}`)
    
    const result = {
      remoteEntryOk: false,
      indexHtmlOk: false,
      remoteAppRunning: false,
      suggestions: [] as string[]
    }
    
    try {
      // 檢查 remoteEntry.js
      const remoteEntryUrl = baseUrl.includes('remoteEntry.js') ? baseUrl : `${baseUrl}/remoteEntry.js`
      try {
        const response = await fetch(remoteEntryUrl)
        result.remoteEntryOk = response.ok
        if (!response.ok) {
          result.suggestions.push(`remoteEntry.js 無法訪問 (${response.status})`)
        }
      } catch (error) {
        result.suggestions.push(`remoteEntry.js 網路錯誤: ${error}`)
      }
      
      // 檢查 index.html (假設 Remote 應用有獨立頁面)
      const indexUrl = baseUrl.replace('/remoteEntry.js', '/').replace(/\/$/, '') + '/'
      try {
        const response = await fetch(indexUrl)
        result.indexHtmlOk = response.ok
        if (response.ok) {
          result.remoteAppRunning = true
        } else {
          result.suggestions.push(`Remote 應用首頁無法訪問 (${response.status})`)
        }
      } catch (error) {
        result.suggestions.push(`Remote 應用首頁網路錯誤: ${error}`)
      }
      
      // 提供建議
      if (!result.remoteEntryOk && !result.indexHtmlOk) {
        result.suggestions.push('Remote 應用可能沒有運行，請檢查:')
        result.suggestions.push('1. Remote 應用是否已啟動 (npm run dev)')
        result.suggestions.push('2. 端口是否正確')
        result.suggestions.push('3. Nginx 配置是否正確')
      } else if (!result.remoteEntryOk) {
        result.suggestions.push('remoteEntry.js 無法訪問，可能是:')
        result.suggestions.push('1. Module Federation 配置問題')
        result.suggestions.push('2. 打包失敗')
        result.suggestions.push('3. 路徑配置錯誤')
      }
      
      return result
      
    } catch (error) {
      result.suggestions.push(`狀態檢查失敗: ${error}`)
      return result
    }
  }
  
  /**
   * 執行完整診斷
   */
  async fullDiagnosis(url: string): Promise<void> {
    console.log('🚀 開始完整診斷...')
    
    // 1. 狀態檢查
    const status = await this.checkRemoteStatus(url)
    console.log('\n📊 Remote 應用狀態:')
    console.log(`  - remoteEntry.js: ${status.remoteEntryOk ? '✅' : '❌'}`)
    console.log(`  - 應用首頁: ${status.indexHtmlOk ? '✅' : '❌'}`)
    console.log(`  - 應用運行: ${status.remoteAppRunning ? '✅' : '❌'}`)
    
    if (status.suggestions.length > 0) {
      console.log('\n💡 建議:')
      status.suggestions.forEach(s => console.log(`  - ${s}`))
    }
    
    // 2. 內容分析
    if (status.remoteEntryOk) {
      console.log('\n🔍 分析 remoteEntry.js 內容...')
      const analysis = await this.analyzeRemoteEntry(url)
      
      if (analysis.errors.length > 0) {
        console.log('\n❌ 錯誤:')
        analysis.errors.forEach(e => console.log(`  - ${e}`))
      }
      
      if (analysis.warnings.length > 0) {
        console.log('\n⚠️ 警告:')
        analysis.warnings.forEach(w => console.log(`  - ${w}`))
      }
      
      // 提供修復建議
      console.log('\n🔧 修復建議:')
      if (!analysis.hasContainerName) {
        console.log('  - 檢查 Remote 的 webpack ModuleFederationPlugin 配置')
        console.log('  - 確保 name 屬性正確設定')
      }
      
      if (!analysis.hasExposes) {
        console.log('  - 檢查 exposes 配置是否正確')
        console.log('  - 確保有暴露組件模組')
      }
      
      if (!analysis.hasInit || !analysis.hasGet) {
        console.log('  - Module Federation 容器可能未正確生成')
        console.log('  - 檢查 webpack 版本和配置')
      }
    }
    
    console.log('\n✅ 診斷完成')
  }
}

// 全域實例
export const remoteContentAnalyzer = new RemoteContentAnalyzer()
