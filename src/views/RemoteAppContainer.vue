<template>
  <div class="remote-app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Monitor /></el-icon>
          <span>{{ appName }} - 微前端應用</span>
          <div class="header-actions">
            <el-button size="small" @click="goBack">
              <el-icon><Back /></el-icon>
              返回
            </el-button>
            <el-button type="primary" size="small" @click="reloadApp">
              <el-icon><Refresh /></el-icon>
              重新載入
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="app-content" v-loading="loading" element-loading-text="載入中...">
        <div v-if="error" class="error-content">
          <el-result icon="error" title="載入失敗" :sub-title="error">
            <template #extra>
              <el-button type="primary" @click="reloadApp">重試</el-button>
            </template>
          </el-result>
        </div>
        
        <div v-else-if="!loading" class="remote-app-wrapper" :id="`remote-app-${appName}`">
          <!-- 這裡將渲染實際的微前端應用 -->
          <el-result icon="info" title="微前端應用容器" :sub-title="`準備載入 ${appName} 應用`">
            <template #extra>
              <el-space>
                <el-button type="primary" @click="loadRemoteApp">載入應用</el-button>
                <el-button @click="showConfig = true">配置</el-button>
              </el-space>
            </template>
          </el-result>
        </div>
      </div>
    </el-card>

    <!-- 配置對話框 -->
    <el-dialog v-model="showConfig" title="應用配置" width="600px">
      <el-descriptions title="應用資訊" :column="1" border>
        <el-descriptions-item label="應用名稱">{{ appName }}</el-descriptions-item>
        <el-descriptions-item label="遠程地址">{{ appConfig.url }}</el-descriptions-item>
        <el-descriptions-item label="暴露模組">{{ appConfig.module }}</el-descriptions-item>
        <el-descriptions-item label="狀態">
          <el-tag :type="appConfig.loaded ? 'success' : 'info'">
            {{ appConfig.loaded ? '已載入' : '未載入' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="showConfig = false">關閉</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Monitor,
  Back,
  Refresh
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const showConfig = ref(false)

const appName = computed(() => route.params.appName as string)

const appConfig = ref({
  url: `http://localhost:3001/remoteEntry.js`,
  module: './App',
  loaded: false
})

const goBack = () => {
  router.push('/remote-apps')
}

const reloadApp = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 模擬重新載入過程
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    appConfig.value.loaded = true
    ElMessage.success(`${appName.value} 重新載入成功`)
  } catch (err) {
    error.value = '載入失敗，請檢查應用配置'
    ElMessage.error('重新載入失敗')
  } finally {
    loading.value = false
  }
}

const loadRemoteApp = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 這裡應該實現實際的微前端載入邏輯
    // 例如使用 webpack 的 import() 動態導入
    console.log(`正在載入微前端應用: ${appName.value}`)
    
    // 模擬載入過程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模擬載入成功
    appConfig.value.loaded = true
    ElMessage.success(`${appName.value} 載入成功`)
    
    // 這裡可以實際載入微前端應用
    // const remoteApp = await import(/* webpackIgnore: true */ appConfig.value.url)
    // 然後將應用渲染到指定容器中
    
  } catch (err) {
    error.value = `無法載入應用 ${appName.value}，請確認應用是否正在運行`
    console.error('載入微前端應用失敗:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log(`準備載入微前端應用: ${appName.value}`)
})
</script>

<style scoped>
.remote-app-container {
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

.app-content {
  min-height: 500px;
}

.error-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.remote-app-wrapper {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
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
