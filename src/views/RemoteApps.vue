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
              <el-result icon="success" title="應用載入成功" :sub-title="`${app.name} 已成功載入`">
                <template #extra>
                  <el-button type="primary" @click="reloadApp(app)">重新載入</el-button>
                </template>
              </el-result>
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
          <el-input v-model="newApp.url" placeholder="http://localhost:3001/remoteEntry.js" />
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
    name: 'demo-app-1',
    description: '示例微前端應用1',
    url: 'http://localhost:3001/remoteEntry.js',
    module: './App',
    status: 'unloaded'
  },
  {
    name: 'demo-app-2',
    description: '示例微前端應用2',
    url: 'http://localhost:3002/remoteEntry.js',
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

const refreshApps = () => {
  ElMessage.success('應用列表已刷新')
}

const loadApp = async (app: RemoteApp) => {
  app.loading = true
  
  try {
    // 模擬載入過程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    app.status = 'loaded'
    loadedApps.value.push({ ...app })
    activeApp.value = app.name
    
    ElMessage.success(`${app.name} 載入成功`)
  } catch (error) {
    ElMessage.error(`${app.name} 載入失敗`)
    console.error('載入應用失敗:', error)
  } finally {
    app.loading = false
  }
}

const unloadApp = (app: RemoteApp) => {
  app.status = 'unloaded'
  loadedApps.value = loadedApps.value.filter(loaded => loaded.name !== app.name)
  
  if (activeApp.value === app.name) {
    activeApp.value = loadedApps.value.length > 0 ? loadedApps.value[0].name : ''
  }
  
  ElMessage.success(`${app.name} 已卸載`)
}

const viewApp = (app: RemoteApp) => {
  router.push(`/remote/${app.name}`)
}

const reloadApp = (app: RemoteApp) => {
  ElMessage.info(`正在重新載入 ${app.name}`)
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
