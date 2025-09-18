<template>
  <div class="test-remote">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Monitor /></el-icon>
          <span>測試遠程組件載入</span>
        </div>
      </template>
      
      <div class="remote-url-input">
        <el-form-item label="Remote URL:">
          <el-input 
            v-model="remoteUrl" 
            placeholder="http://localhost:3001/remoteEntry.js"
            style="width: 400px"
          />
        </el-form-item>
      </div>

      <div class="test-controls">
        <el-space wrap>
          <el-button type="primary" @click="loadRemoteComponent" :loading="loading">
            載入 Remote 組件
          </el-button>
          <el-button type="danger" @click="unloadComponent" :disabled="!componentLoaded">
            卸載組件
          </el-button>
          <el-button type="info" @click="analyzeRemote" :loading="analyzeLoading">
            分析 Remote
          </el-button>
          <el-button type="warning" @click="testAllMethods" :loading="testAllLoading">
            測試所有載入方式
          </el-button>
          <el-button type="danger" @click="fullDiagnosis" :loading="diagnosisLoading">
            完整診斷
          </el-button>
        </el-space>
      </div>

      <el-divider />

      <div class="remote-container" ref="containerRef" v-show="componentLoaded">
        <!-- Workflow 組件將會渲染在這裡 -->
      </div>

      <el-empty v-show="!componentLoaded" description="尚未載入遠程組件" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Monitor } from '@element-plus/icons-vue'

const componentLoaded = ref(false)
const loading = ref(false)
const analyzeLoading = ref(false)
const testAllLoading = ref(false)
const diagnosisLoading = ref(false)
const remoteUrl = ref('http://localhost:3001/remoteEntry.js')
const containerRef = ref<HTMLElement>()
let remoteApp: any = null

// 主要載入函數（使用已驗證有效的方法）
const loadRemoteComponent = async () => {
  if (!containerRef.value) {
    ElMessage.error('找不到容器元素')
    return
  }

  loading.value = true
  
  try {
    console.log('🎯 載入 Remote 組件（使用已驗證方法）...')
    
    // 使用已驗證有效的載入器
    const { workingRemoteLoader } = await import('@/utils/workingRemoteLoader')
    
    // 智能載入組件
    const result = await workingRemoteLoader.smartLoad(remoteUrl.value)
    
    if (!result.success) {
      throw new Error(`載入失敗: ${result.error}`)
    }
    
    if (!result.component) {
      throw new Error('載入成功但未取得組件')
    }
    
    console.log(`✅ 組件載入成功，使用方法: ${result.method}`)
    
    // 渲染組件
    const { createApp } = await import('vue')
    remoteApp = createApp(result.component)
    remoteApp.mount(containerRef.value)
    componentLoaded.value = true
    
    ElMessage.success(`載入成功！方法: ${result.method}`)
    
  } catch (error) {
    console.error('載入失敗:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    ElMessage.error(`載入失敗: ${errorMessage}`)
  } finally {
    loading.value = false
  }
}

const unloadComponent = () => {
  if (remoteApp && containerRef.value) {
    remoteApp.unmount()
    containerRef.value.innerHTML = ''
    remoteApp = null
    componentLoaded.value = false
    ElMessage.success('組件已卸載')
  }
}

const analyzeRemote = async () => {
  analyzeLoading.value = true
  
  try {
    console.log('🔍 開始分析 RemoteEntry.js...')
    
    // 簡單的 fetch 檢查
    const response = await fetch(remoteUrl.value)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const content = await response.text()
    console.log(`✅ RemoteEntry.js 可訪問 (${content.length} 字元)`)
    
    // 檢查內容是否包含預期的關鍵字
    const hasWorkflow = content.includes('workflow')
    const hasModuleFederation = content.includes('__webpack_require__')
    
    console.log('📋 分析結果:')
    console.log(`  - 包含 workflow: ${hasWorkflow}`)
    console.log(`  - 包含 Module Federation: ${hasModuleFederation}`)
    
    if (hasWorkflow && hasModuleFederation) {
      ElMessage.success('RemoteEntry.js 分析通過！')
    } else {
      ElMessage.warning('RemoteEntry.js 內容可能有問題')
    }
    
  } catch (error) {
    console.error('分析失敗:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    ElMessage.error(`分析失敗: ${errorMessage}`)
  } finally {
    analyzeLoading.value = false
  }
}

const testAllMethods = async () => {
  testAllLoading.value = true
  
  try {
    console.log('🧪 開始測試所有載入方式...')
    
    const { allLoadingMethods } = await import('@/utils/allLoadingMethods')
    
    // 執行所有方法測試
    const results = await allLoadingMethods.testAllMethods(remoteUrl.value)
    
    // 顯示結果摘要
    const successCount = results.filter(r => r.success).length
    console.log(`📊 測試完成: ${successCount}/${results.length} 方法成功`)
    
    // 嘗試用第一個成功的方法載入組件
    const successfulResult = results.find(r => r.success)
    
    if (successfulResult && successfulResult.component && containerRef.value) {
      console.log(`🎉 使用成功的方法載入組件: ${successfulResult.method}`)
      
      // 渲染組件
      const { createApp } = await import('vue')
      
      // 先卸載現有組件
      if (remoteApp) {
        remoteApp.unmount()
        containerRef.value.innerHTML = ''
      }
      
      remoteApp = createApp(successfulResult.component)
      remoteApp.mount(containerRef.value)
      componentLoaded.value = true
      
      ElMessage.success(`測試完成！成功方法: ${successfulResult.method} (${successCount}/${results.length})`)
    } else {
      ElMessage.error(`所有 ${results.length} 種方法都失敗了，請檢查控制台詳細日誌`)
      
      // 顯示失敗摘要
      console.log('\n❌ 所有方法都失敗了:')
      results.forEach((result, index) => {
        console.log(`  方法 ${index + 1} (${result.method}): ${result.error}`)
      })
    }
    
  } catch (error) {
    console.error('測試過程失敗:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    ElMessage.error(`測試失敗: ${errorMessage}`)
  } finally {
    testAllLoading.value = false
  }
}

const fullDiagnosis = async () => {
  diagnosisLoading.value = true
  
  try {
    console.log('🚀 開始完整診斷...')
    
    const { remoteContentAnalyzer } = await import('@/utils/remoteContentAnalyzer')
    
    // 執行完整診斷
    await remoteContentAnalyzer.fullDiagnosis(remoteUrl.value)
    
    ElMessage.info('完整診斷完成，請查看控制台詳細報告')
    
  } catch (error) {
    console.error('診斷過程失敗:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    ElMessage.error(`診斷失敗: ${errorMessage}`)
  } finally {
    diagnosisLoading.value = false
  }
}

onUnmounted(() => {
  unloadComponent()
})
</script>

<style scoped>
.test-remote {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.header-icon {
  font-size: 20px;
  color: #409eff;
}

.remote-url-input {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.test-controls {
  margin-bottom: 20px;
}

.remote-container {
  min-height: 400px;
  border: 2px dashed #e4e7ed;
  border-radius: 6px;
  padding: 20px;
}
</style>

