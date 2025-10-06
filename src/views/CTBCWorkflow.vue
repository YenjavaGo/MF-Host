<template>
  <div class="ctbc-workflow">
    <!-- Header -->
    <div class="ctbc-header">
      <div class="header-left">
        <el-button 
          type="primary" 
          :icon="Expand" 
          @click="toggleSidebar"
          class="sidebar-toggle"
        />
      </div>
      
      <div class="header-center">
        <div class="system-label">
          <img src="/logo.svg" alt="Logo" class="logo" v-if="false" />
          <span class="system-title">CTBC Workflow Management System</span>
          <span class="system-subtitle">中國信託工作流程管理系統</span>
        </div>
      </div>
      
      <div class="header-right">
        <el-dropdown>
          <span class="user-info">
            <el-icon><User /></el-icon>
            管理員
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>個人設定</el-dropdown-item>
              <el-dropdown-item>系統設定</el-dropdown-item>
              <el-dropdown-item divided>登出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Main Content -->
    <div class="ctbc-content">
      <!-- Sidebar -->
      <div 
        class="ctbc-sidebar" 
        :class="{ collapsed: sidebarCollapsed }"
      >
        <el-menu
          :default-active="activeMenuItem"
          class="ctbc-menu"
          :collapse="sidebarCollapsed"
          :unique-opened="true"
          @select="handleMenuSelect"
        >
          <!-- 工作流程管理 -->
          <el-sub-menu index="workflow">
            <template #title>
              <el-icon><Operation /></el-icon>
              <span>工作流程管理</span>
            </template>
            <el-menu-item 
              index="workflow-route"
              @click="() => loadRemoteApp('workflow-route', '路由控制')"
            >
              路由控制
            </el-menu-item>
            <el-menu-item 
              index="workflow-management"
              @click="() => loadRemoteApp('workflow-management', '工作流程管理')"
            >
              工作流程管理
            </el-menu-item>
            <el-menu-item 
              index="workflow-list"
              @click="() => loadRemoteApp('workflow-list', '工作流程列表')"
            >
              工作流程列表
            </el-menu-item>
          </el-sub-menu>

          <!-- AI助理 -->
          <el-sub-menu index="ai">
            <template #title>
              <el-icon><ChatDotRound /></el-icon>
              <span>AI助理</span>
            </template>
            <el-menu-item 
              index="ai-document"
              @click="() => loadRemoteApp('ai-document', '文件管理')"
            >
              文件管理
            </el-menu-item>
            <el-menu-item 
              index="ai-flow"
              @click="() => loadRemoteApp('ai-flow', '流程管理')"
            >
              流程管理
            </el-menu-item>
            <el-menu-item 
              index="ai-editor"
              @click="() => loadRemoteApp('ai-editor', '編輯器測試')"
            >
              編輯器測試
            </el-menu-item>
            <el-menu-item 
              index="ai-params"
              @click="() => loadRemoteApp('ai-params', '參數設定')"
            >
              參數設定
            </el-menu-item>
            <el-menu-item 
              index="ai-score"
              @click="() => loadRemoteApp('ai-score', '評分結果查詢')"
            >
              評分結果查詢
            </el-menu-item>
            <el-menu-item 
              index="ai-record"
              @click="() => loadRemoteApp('ai-record', '流程記錄查詢')"
            >
              流程記錄查詢
            </el-menu-item>
            <el-menu-item 
              index="ai-link"
              @click="() => loadRemoteApp('ai-link', '連結管理')"
            >
              連結管理
            </el-menu-item>
            <el-menu-item 
              index="ai-semantic"
              @click="() => loadRemoteApp('ai-semantic', '語意檢核設定')"
            >
              語意檢核設定
            </el-menu-item>
          </el-sub-menu>

          <!-- ATM影像管理 -->
          <el-sub-menu index="atm">
            <template #title>
              <el-icon><VideoCamera /></el-icon>
              <span>ATM影像管理</span>
            </template>
            <el-menu-item 
              index="atm-params"
              @click="() => loadRemoteApp('atm-params', '系統參數')"
            >
              系統參數
            </el-menu-item>
            <el-menu-item 
              index="atm-video"
              @click="() => loadRemoteApp('atm-video', '影片收檔紀錄')"
            >
              影片收檔紀錄
            </el-menu-item>
            <el-menu-item 
              index="atm-security"
              @click="() => loadRemoteApp('atm-security', '保全影片處理結果')"
            >
              保全影片處理結果
            </el-menu-item>
            <el-menu-item 
              index="atm-investigation"
              @click="() => loadRemoteApp('atm-investigation', '檢調影片處理結果')"
            >
              檢調影片處理結果
            </el-menu-item>
          </el-sub-menu>

          <!-- LLM -->
          <el-sub-menu index="llm">
            <template #title>
              <el-icon><Cpu /></el-icon>
              <span>LLM</span>
            </template>
            <el-menu-item 
              index="llm-agent"
              @click="() => loadRemoteApp('llm-agent', 'Agent')"
            >
              Agent
            </el-menu-item>
            <el-menu-item 
              index="llm-prompt-list"
              @click="() => loadRemoteApp('llm-prompt-list', '提示詞設定')"
            >
              提示詞設定
            </el-menu-item>
            <el-menu-item 
              index="llm-hyper-param"
              @click="() => loadRemoteApp('llm-hyper-param', '超參數設定')"
            >
              超參數設定
            </el-menu-item>
            <el-menu-item 
              index="llm-content-log"
              @click="() => loadRemoteApp('llm-content-log', 'LLM歷程')"
            >
              LLM歷程
            </el-menu-item>
          </el-sub-menu>

          <!-- ASR管理 -->
          <el-sub-menu index="asr">
            <template #title>
              <el-icon><Microphone /></el-icon>
              <span>ASR管理</span>
            </template>
            <el-menu-item 
              index="asr-dialog"
              @click="() => loadRemoteApp('asr-dialog', 'ASR對話紀錄')"
            >
              ASR對話紀錄
            </el-menu-item>
          </el-sub-menu>

          <!-- 排程管理 -->
          <el-sub-menu index="schedule">
            <template #title>
              <el-icon><Timer /></el-icon>
              <span>排程管理</span>
            </template>
            <el-menu-item 
              index="schedule-config"
              @click="() => loadRemoteApp('schedule-config', '排程設定')"
            >
              排程設定
            </el-menu-item>
            <el-menu-item 
              index="schedule-history"
              @click="() => loadRemoteApp('schedule-history', '排程歷程')"
            >
              排程歷程
            </el-menu-item>
          </el-sub-menu>

          <!-- 其他 -->
          <el-sub-menu index="others">
            <template #title>
              <el-icon><MoreFilled /></el-icon>
              <span>其他</span>
            </template>
            <el-menu-item 
              index="others-system"
              @click="() => loadRemoteApp('others-system', '系統管理')"
            >
              系統管理
            </el-menu-item>
            <el-menu-item 
              index="others-log"
              @click="() => loadRemoteApp('others-log', '系統日誌')"
            >
              系統日誌
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>

      <!-- Main Panel -->
      <div class="ctbc-main">
        <div class="remote-app-container">
          <div v-if="currentRemoteApp" class="app-header">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>CTBC Workflow</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentRemoteApp.title }}</el-breadcrumb-item>
            </el-breadcrumb>
            <el-button 
              type="danger" 
              size="small" 
              @click="closeRemoteApp"
              :icon="Close"
            >
              關閉
            </el-button>
          </div>
          
          <div 
            class="remote-content" 
            :id="`remote-${currentRemoteApp?.id || 'default'}`"
            v-loading="remoteLoading"
            element-loading-text="載入模組中..."
          >
            <!-- Remote app will be mounted here -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Expand,
  User,
  ArrowDown,
  Operation,
  ChatDotRound,
  VideoCamera,
  Cpu,
  Microphone,
  Timer,
  MoreFilled,
  Close
} from '@element-plus/icons-vue'

interface RemoteApp {
  id: string
  title: string
  url?: string
  module?: string
}

const sidebarCollapsed = ref(false)
const activeMenuItem = ref('')
const remoteLoading = ref(false)
const currentRemoteApp = ref<RemoteApp | null>(null)

// Remote apps mapping - 對應 webpack.config.js 中的 ModuleFederationPlugin 設定
const remoteAppsConfig = reactive({
  // 工作流程管理模組 - 對應 webpack.config.js 中的 'workflow' remote
  'workflow-route': {
    remoteName: 'workflow',
    module: './FlowManager'
  },
  'workflow-management': {
    remoteName: 'workflow', 
    module: './FlowManagement'  // 原本的流程管理組件
  },
  'workflow-list': {
    remoteName: 'workflow',
    module: './WorkflowList'
  },
  // LLM 相關模組 - 對應 webpack.config.js 中的 'llm_web' remote
  'llm-agent': {
    remoteName: 'llm_web',
    module: './agent'
  },
  'llm-prompt-list': {
    remoteName: 'llm_web',
    module: './promptList'
  },
  'llm-content-log': {
    remoteName: 'llm_web',
    module: './contentLog'
  },
  'llm-hyper-param': {
    remoteName: 'llm_web',
    module: './hyperParam'
  }
  // 其他模組可以在這裡添加對應的 remote 配置
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleMenuSelect = (key: string) => {
  // 只更新活躍選單項目，不進行任何導航
  activeMenuItem.value = key
  // 防止任何可能的路由跳轉
  return false
}

const loadRemoteApp = async (appId: string, title: string) => {
  if (currentRemoteApp.value?.id === appId) {
    return // 已經載入相同的應用
  }

  // 設置活躍選單項目
  activeMenuItem.value = appId
  remoteLoading.value = true
  
  try {
    // 清理之前的應用
    if (currentRemoteApp.value) {
      const prevContainer = document.getElementById(`remote-${currentRemoteApp.value.id}`)
      if (prevContainer) {
        prevContainer.innerHTML = ''
      }
    }

    // 設置當前應用
    currentRemoteApp.value = {
      id: appId,
      title: title,
      ...remoteAppsConfig[appId as keyof typeof remoteAppsConfig]
    }

    // 等待 DOM 更新
    await new Promise(resolve => setTimeout(resolve, 100))

    // 獲取容器
    const container = document.getElementById(`remote-${appId}`)
    if (!container) {
      throw new Error('找不到應用容器')
    }

    // 檢查是否有配置的 remote 應用
    const config = remoteAppsConfig[appId as keyof typeof remoteAppsConfig]
    if (config) {
      console.log(`配置找到:`, config)
      await loadActualRemoteApp(config.remoteName, config.module, container)
      ElMessage.success(`${title} 載入成功`)
    } else {
      // 顯示佔位內容
      showPlaceholderContent(container, title)
      ElMessage.info(`${title} - 開發中，顯示佔位內容`)
    }

  } catch (error) {
    console.error('載入 remote 應用失敗:', error)
    
    // 顯示詳細的錯誤信息
    let errorMessage = `載入 ${title} 失敗`
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`
    }
    
    ElMessage.error(errorMessage)
    currentRemoteApp.value = null
    
    // 在控制台顯示更詳細的錯誤信息
    console.error('詳細錯誤信息:', {
      appId,
      title,
      config: remoteAppsConfig[appId as keyof typeof remoteAppsConfig],
      error: error instanceof Error ? error.stack : error
    })
  } finally {
    remoteLoading.value = false
  }
}

const loadActualRemoteApp = async (remoteName: string, module: string, container: HTMLElement) => {
  try {
    console.log(`載入 remote 應用: ${remoteName}${module}`)
    
    // 確保容器元素存在且有效
    if (!container || !container.parentNode) {
      throw new Error('容器元素無效')
    }
    
    // 清空容器內容
    container.innerHTML = ''
    
    // 等待一下確保容器清空
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 根據 remoteName 選擇對應的 remoteEntry.js
    const getRemoteEntryUrl = (name: string): string => {
      switch (name) {
        case 'workflow':
          return 'http://localhost:3001/workflow/remoteEntry.js'
        case 'llm_web':
          return 'http://localhost:3003/llm_web/remoteEntry.js'
        default:
          throw new Error(`未知的 remote 應用: ${name}`)
      }
    }
    
    const remoteEntryUrl = getRemoteEntryUrl(remoteName)
    console.log(`使用 remoteEntry URL: ${remoteEntryUrl}`)
    
    // 使用 workingRemoteLoader 載入 remote 應用
    const { workingRemoteLoader } = await import('@/utils/workingRemoteLoader')
    
    // 載入特定模組
    const Component = await workingRemoteLoader.loadModule(module, remoteEntryUrl)
    
    if (!Component) {
      throw new Error(`無法從 ${remoteName}${module} 取得組件`)
    }

    console.log(`成功載入 remote 組件:`, Component)

    // 檢查組件是否為有效的 Vue 組件
    if (!Component || typeof Component !== 'object') {
      throw new Error('載入的組件無效')
    }
    
    // 創建並掛載 Vue 應用
    const { createApp } = await import('vue')
    
    // 確保 Vue 功能標誌正確設置
    if (typeof window !== 'undefined') {
      const window_ = window as any
      if (!window_.__VUE_OPTIONS_API__) {
        window_.__VUE_OPTIONS_API__ = true
      }
      if (!window_.__VUE_PROD_DEVTOOLS__) {
        window_.__VUE_PROD_DEVTOOLS__ = false
      }
    }
    
    // 創建 Vue 應用實例
    const remoteApp = createApp(Component)
    
    // 添加必要的全局屬性
    remoteApp.config.globalProperties.$isServer = false
    
    // 確保 Vue Flow 能正確初始化
    remoteApp.config.errorHandler = (err, instance, info) => {
      console.warn('Vue 錯誤已捕獲:', err, info)
      // 不讓錯誤中斷應用運行
      return false
    }
    
    // 添加全局屬性，確保 Vue Flow 能正確運行
    remoteApp.config.globalProperties.$vueFlowReady = true
    remoteApp.config.globalProperties.$isModuleFederation = true
    
    // 設置 Vue 的全局配置
    remoteApp.config.warnHandler = (msg, instance, trace) => {
      console.warn('Vue 警告:', msg, trace)
    }
    
    
    // 確保容器在 DOM 中
    if (!document.contains(container)) {
      throw new Error('容器不在 DOM 中')
    }
    
    // 使用 nextTick 確保 DOM 更新完成
    const { nextTick } = await import('vue')
    await nextTick()
    
    // 額外等待，確保所有依賴都已載入
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 掛載組件到容器
    try {
      // 確保容器是空的
      container.innerHTML = ''
      
      // 創建一個臨時的 div 作為掛載點
      const mountDiv = document.createElement('div')
      mountDiv.style.width = '100%'
      mountDiv.style.height = '100%'
      container.appendChild(mountDiv)
      
      remoteApp.mount(mountDiv)
      console.log('✅ Remote 組件掛載成功')
    } catch (mountError) {
      console.error('❌ 組件掛載失敗:', mountError)
      const errorMessage = mountError instanceof Error ? mountError.message : String(mountError)
      throw new Error(`組件掛載失敗: ${errorMessage}`)
    }
    
  } catch (error) {
    console.error('載入實際 remote 應用失敗:', error)
    throw error
  }
}

const showPlaceholderContent = (container: HTMLElement, title: string) => {
  container.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      background: #f5f7fa;
      border-radius: 8px;
      color: #909399;
    ">
      <div style="font-size: 48px; margin-bottom: 16px;">🚧</div>
      <h3 style="margin: 0 0 8px 0; color: #303133;">${title}</h3>
      <p style="margin: 0; font-size: 14px;">此模組正在開發中，敬請期待</p>
      <div style="margin-top: 20px; font-size: 12px; color: #c0c4cc;">
        Module ID: ${currentRemoteApp.value?.id}
      </div>
    </div>
  `
}

const closeRemoteApp = () => {
  if (currentRemoteApp.value) {
    const container = document.getElementById(`remote-${currentRemoteApp.value.id}`)
    if (container) {
      container.innerHTML = ''
    }
  }
  currentRemoteApp.value = null
  activeMenuItem.value = ''
  console.log('Remote 應用已關閉')
}

onMounted(() => {
  console.log('CTBC Workflow 系統已初始化')
})
</script>

<style scoped>
.ctbc-workflow {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e8f4fd 0%, #b3d9f2 50%, #87ceeb 100%);
}

.ctbc-header {
  height: 60px;
  background: #ffffff;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-left {
  width: 200px;
}

.sidebar-toggle {
  border: none;
  background: transparent;
  color: #409eff;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.system-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.system-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.system-subtitle {
  font-size: 12px;
  color: #909399;
}

.header-right {
  width: 200px;
  display: flex;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
}

.ctbc-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.ctbc-sidebar {
  width: 200px;
  background: #ffffff;
  border-right: 1px solid #f0f0f0;
  transition: width 0.3s ease;
  overflow: hidden;
}

.ctbc-sidebar.collapsed {
  width: 64px;
}

.ctbc-menu {
  height: 100%;
  border: none;
}

.ctbc-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}


.remote-app-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  height: 100%;
  overflow: hidden;
}

.app-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  border-radius: 8px 8px 0 0;
}

.remote-content {
  flex: 1;
  padding: 0;
  overflow: auto;
  height: 100%;
}

/* Element Plus Menu 自定義樣式 */
:deep(.el-menu) {
  background-color: transparent;
}

:deep(.el-menu-item) {
  color: #606266;
}

:deep(.el-menu-item:hover) {
  background-color: #ecf5ff;
  color: #409eff;
}

:deep(.el-menu-item.is-active) {
  background-color: #ecf5ff;
  color: #409eff;
}

:deep(.el-sub-menu__title) {
  color: #303133;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #ecf5ff;
  color: #409eff;
}
</style>
