<template>
  <div class="remotes-content">
    <el-card class="remotes-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Connection /></el-icon>
          <span>{{ $t('remoteApps.title') }}</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="refreshApps">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="success" size="small" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              添加應用
            </el-button>
          </div>
        </div>
      </template>
      
      <el-alert
        :title="$t('remoteApps.loadingArea')"
        type="warning"
        :closable="false"
        show-icon
      >
        <p>{{ $t('remoteApps.loadingDescription') }}</p>
        <p>{{ $t('remoteApps.configDescription') }}</p>
      </el-alert>

      <!-- 遠程應用列表 -->
      <div class="remote-apps-list">
        <el-row :gutter="20" v-if="remoteApps.length > 0">
          <el-col :span="8" v-for="app in remoteApps" :key="app.name">
            <el-card class="app-card" shadow="hover">
              <div class="app-info">
                <div class="app-icon">
                  <el-icon><Monitor /></el-icon>
                </div>
                <div class="app-details">
                  <h4>{{ app.name }}</h4>
                  <p>{{ app.description }}</p>
                  <el-tag :type="app.status === 'loaded' ? 'success' : 'info'" size="small">
                    {{ app.status === 'loaded' ? '已載入' : '未載入' }}
                  </el-tag>
                </div>
              </div>
              <div class="app-actions">
                <el-button 
                  v-if="app.status !== 'loaded'"
                  type="primary" 
                  size="small" 
                  @click="loadApp(app)"
                  :loading="app.loading"
                >
                  {{ $t('remoteApps.loadApp') }}
                </el-button>
                <el-button 
                  v-else
                  type="danger" 
                  size="small" 
                  @click="unloadApp(app)"
                >
                  {{ $t('remoteApps.unloadApp') }}
                </el-button>
                <el-button size="small" @click="viewApp(app)">
                  查看
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-empty v-else :description="$t('remoteApps.noApps')" />
      </div>

      <!-- 動態載入的應用容器 -->
      <div v-if="loadedApps.length > 0" class="loaded-apps-container">
        <el-divider content-position="left">已載入的應用</el-divider>
        <el-tabs v-model="activeApp" type="card" closable @tab-remove="handleTabRemove">
          <el-tab-pane 
            v-for="app in loadedApps" 
            :key="app.name" 
            :label="app.name" 
            :name="app.name"
          >
            <div class="remote-app-container" :id="`remote-${app.name}`">
              <!-- 這裡將動態載入微前端應用 -->
              <!-- 微前端應用將會渲染在這個容器中 -->
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- 添加應用對話框 -->
    <el-dialog v-model="showAddDialog" title="添加微前端應用" width="600px">
      <el-form :model="newApp" label-width="120px">
        <el-form-item label="應用名稱" required>
          <el-input v-model="newApp.name" placeholder="請輸入應用名稱" />
        </el-form-item>
        <el-form-item label="應用描述">
          <el-input v-model="newApp.description" placeholder="請輸入應用描述" />
        </el-form-item>
        <el-form-item label="遠程地址" required>
          <el-input v-model="newApp.url" placeholder="http://localhost:3001/workflow/remoteEntry.js" />
        </el-form-item>
        <el-form-item label="暴露模組">
          <el-input v-model="newApp.module" placeholder="./App" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addApp">確定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Connection,
  Monitor,
  Refresh,
  Plus
} from '@element-plus/icons-vue'

interface RemoteApp {
  name: string
  description: string
  url: string
  module: string
  status: 'loaded' | 'unloaded'
  loading?: boolean
}

const router = useRouter()

const showAddDialog = ref(false)
const activeApp = ref('')
const remoteApps = ref<RemoteApp[]>([
  {
    name: 'workflow',
    description: 'Workflow 工作流程管理應用',
    url: 'http://localhost:3001/workflow/remoteEntry.js',
    module: './App',
    status: 'unloaded'
  }
])

const loadedApps = ref<RemoteApp[]>([])

const newApp = reactive({
  name: '',
  description: '',
  url: '',
  module: './App'
})

const refreshApps = async () => {
  try {
    // 檢查所有遠程應用狀態
    const { remoteChecker } = await import('@/utils/remoteChecker')
    const remoteList = remoteApps.value.map(app => ({ name: app.name, url: app.url }))
    const statuses = await remoteChecker.checkMultipleRemotes(remoteList)
    
    let availableCount = 0
    statuses.forEach(status => {
      const app = remoteApps.value.find(app => app.name === status.name)
      if (app) {
        // 可以在這裡更新應用狀態顯示
        if (status.available) {
          availableCount++
        }
      }
    })
    
    ElMessage.success(`應用列表已刷新 - ${availableCount}/${statuses.length} 個應用可用`)
    
    // 顯示詳細狀態
    statuses.forEach(status => {
      if (!status.available) {
        console.warn(`${status.name} 不可用:`, status.error)
      }
    })
    
  } catch (error) {
    console.error('檢查應用狀態失敗:', error)
    ElMessage.success('應用列表已刷新')
  }
}

const loadApp = async (app: RemoteApp) => {
  app.loading = true
  
  try {
    // 先檢查遠程應用是否可用
    const { remoteChecker } = await import('@/utils/remoteChecker')
    const status = await remoteChecker.checkRemoteStatus(app.name, app.url)
    
    if (!status.available) {
      throw new Error(`遠程應用不可用: ${status.error}`)
    }
    
    // 先添加到載入列表，讓容器在模板中建立
    app.status = 'loaded'
    loadedApps.value.push({ ...app })
    activeApp.value = app.name
    
    // 等待 DOM 更新
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 取得容器
    const containerId = `remote-${app.name}`
    const container = document.getElementById(containerId)
    
    if (!container) {
      throw new Error('無法建立應用容器')
    }

    // 使用多種載入方式（基於 TestRemote 的成功經驗）
    console.log(`🚀 嘗試載入: ${app.name}/${app.module}`)
    
    let Component = null
    let successMethod = ''
    
    // 方法 1: 使用已驗證的 workingRemoteLoader
    try {
      console.log('🔄 方法 1: 使用 workingRemoteLoader')
      const { workingRemoteLoader } = await import('@/utils/workingRemoteLoader')
      const result = await workingRemoteLoader.smartLoad(app.url)
      
      if (result.success && result.component) {
        Component = result.component
        successMethod = `workingRemoteLoader (${result.method})`
        console.log(`✅ 方法 1 成功: ${successMethod}`)
      }
    } catch (error) {
      console.log('❌ 方法 1 失敗:', error)
    }
    
    // 方法 2: 使用 allLoadingMethods 測試所有方式
    if (!Component) {
      try {
        console.log('🔄 方法 2: 使用 allLoadingMethods')
        const { allLoadingMethods } = await import('@/utils/allLoadingMethods')
        const results = await allLoadingMethods.testAllMethods(app.url)
        
        const successfulResult = results.find(r => r.success)
        if (successfulResult && successfulResult.component) {
          Component = successfulResult.component
          successMethod = `allLoadingMethods (${successfulResult.method})`
          console.log(`✅ 方法 2 成功: ${successMethod}`)
        }
      } catch (error) {
        console.log('❌ 方法 2 失敗:', error)
      }
    }
    
    // 方法 3: webpack import (原始方法)
    if (!Component) {
      try {
        console.log('🔄 方法 3: webpack import')
        const moduleKey = app.module.startsWith('./') ? app.module.slice(2) : app.module
        const remoteModule = await eval(`import(/* webpackChunkName: "remote-[request]" */ '${app.name}/${moduleKey}')`)
        Component = remoteModule.default || remoteModule
        if (Component) {
          successMethod = 'webpack import'
          console.log('✅ 方法 3 成功: webpack import')
        }
      } catch (error) {
        console.log('❌ 方法 3 失敗:', error)
      }
    }
    
    // 方法 4: 備用 remoteLoader
    if (!Component) {
      try {
        console.log('🔄 方法 4: remoteLoader')
        const { remoteLoader } = await import('@/utils/remoteLoader')
        Component = await remoteLoader.loadRemoteComponent({
          name: app.name,
          remoteName: app.name,
          module: app.module,
          container
        })
        if (Component) {
          successMethod = 'remoteLoader'
          console.log('✅ 方法 4 成功: remoteLoader')
        }
      } catch (error) {
        console.log('❌ 方法 4 失敗:', error)
      }
    }
    
    // 檢查是否有成功的方法
    if (!Component) {
      throw new Error(`所有載入方法都失敗了。嘗試的方法: workingRemoteLoader, allLoadingMethods, webpack import, remoteLoader`)
    }
    
    // 渲染組件
    const { createApp } = await import('vue')
    const remoteApp = createApp(Component)
    remoteApp.mount(container)
    
    console.log(`🎉 ${app.name} 載入成功，使用方法: ${successMethod}`)

    console.log(`${app.name} 載入並掛載成功`)
    ElMessage.success(`${app.name} 載入成功 (${successMethod})`)
    
  } catch (error) {
    // 如果載入失敗，從載入列表中移除
    app.status = 'unloaded'
    loadedApps.value = loadedApps.value.filter(loaded => loaded.name !== app.name)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    ElMessage.error(`${app.name} 載入失敗: ${errorMessage}`)
    console.error('載入應用失敗:', error)
  } finally {
    app.loading = false
  }
}

const unloadApp = async (app: RemoteApp) => {
  try {
    // 使用新的遠程載入器卸載
    const { remoteLoader } = await import('@/utils/remoteLoader')
    remoteLoader.unloadRemoteComponent(app.name)
    
    app.status = 'unloaded'
    loadedApps.value = loadedApps.value.filter(loaded => loaded.name !== app.name)
    
    if (activeApp.value === app.name) {
      activeApp.value = loadedApps.value.length > 0 ? loadedApps.value[0].name : ''
    }
    
    ElMessage.success(`${app.name} 已卸載`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    ElMessage.error(`${app.name} 卸載失敗: ${errorMessage}`)
    console.error('卸載應用失敗:', error)
  }
}

const viewApp = (app: RemoteApp) => {
  router.push(`/remote/${app.name}`)
}

const reloadApp = async (app: RemoteApp) => {
  try {
    ElMessage.info(`正在重新載入 ${app.name}`)
    
    // 使用微前端載入工具重新載入
    const { microfrontendLoader } = await import('@/utils/microfrontend')
    await microfrontendLoader.reloadApp(app.name)
    
    ElMessage.success(`${app.name} 重新載入成功`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    ElMessage.error(`${app.name} 重新載入失敗: ${errorMessage}`)
    console.error('重新載入應用失敗:', error)
  }
}

const handleTabRemove = (targetName: string) => {
  const app = remoteApps.value.find(app => app.name === targetName)
  if (app) {
    unloadApp(app)
  }
}

const addApp = () => {
  if (!newApp.name || !newApp.url) {
    ElMessage.error('請填寫必要資訊')
    return
  }
  
  remoteApps.value.push({
    name: newApp.name,
    description: newApp.description,
    url: newApp.url,
    module: newApp.module,
    status: 'unloaded'
  })
  
  // 重置表單
  Object.assign(newApp, {
    name: '',
    description: '',
    url: '',
    module: './App'
  })
  
  showAddDialog.value = false
  ElMessage.success('應用添加成功')
}
</script>

<style scoped>
.remotes-content {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 600;
}

.card-header > span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 20px;
  color: #409eff;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.remote-apps-list {
  margin-top: 20px;
}

.app-card {
  margin-bottom: 16px;
}

.app-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.app-icon {
  font-size: 32px;
  color: #409eff;
  margin-top: 4px;
}

.app-details h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.app-details p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.app-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.loaded-apps-container {
  margin-top: 30px;
}

.remote-app-container {
  min-height: 400px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
