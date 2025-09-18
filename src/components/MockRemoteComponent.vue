<template>
  <div class="mock-remote-component">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Cpu /></el-icon>
          <span>Mock Workflow 組件</span>
          <el-tag type="success" size="small">模擬組件</el-tag>
        </div>
      </template>
      
      <el-alert 
        title="這是一個模擬的遠程組件" 
        type="info" 
        :closable="false"
        show-icon
      >
        <p>用於測試微前端載入功能，當真正的 remote 應用配置正確後，可以替換為實際組件。</p>
      </el-alert>
      
      <div class="mock-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="never">
              <h4>工作流程狀態</h4>
              <el-progress :percentage="mockProgress" :status="progressStatus" />
              <p>當前步驟: {{ currentStep }}</p>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never">
              <h4>操作控制</h4>
              <el-space>
                <el-button type="primary" @click="startWorkflow" :disabled="isRunning">
                  <el-icon><VideoPlay /></el-icon>
                  開始工作流程
                </el-button>
                <el-button type="warning" @click="pauseWorkflow" :disabled="!isRunning">
                  <el-icon><VideoPause /></el-icon>
                  暫停
                </el-button>
                <el-button type="danger" @click="resetWorkflow">
                  <el-icon><RefreshLeft /></el-icon>
                  重置
                </el-button>
              </el-space>
            </el-card>
          </el-col>
        </el-row>
        
        <el-divider />
        
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in workflowSteps"
            :key="index"
            :type="getStepType(index)"
            :icon="getStepIcon(index)"
          >
            <h4>{{ item.title }}</h4>
            <p>{{ item.description }}</p>
            <span class="step-time">{{ item.time }}</span>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Cpu, 
  VideoPlay, 
  VideoPause, 
  RefreshLeft 
} from '@element-plus/icons-vue'

const mockProgress = ref(0)
const currentStep = ref('準備中')
const isRunning = ref(false)
let progressTimer: number | null = null

const progressStatus = computed(() => {
  if (mockProgress.value === 100) return 'success'
  if (isRunning.value) return 'active'
  return 'normal'
})

const workflowSteps = ref([
  {
    title: '初始化工作流程',
    description: '設定工作環境和參數',
    time: '2024-01-01 10:00:00'
  },
  {
    title: '數據處理',
    description: '處理輸入數據和驗證',
    time: '2024-01-01 10:05:00'
  },
  {
    title: '執行核心邏輯',
    description: '執行主要業務邏輯',
    time: '2024-01-01 10:10:00'
  },
  {
    title: '生成結果',
    description: '產生最終結果並保存',
    time: '2024-01-01 10:15:00'
  }
])

const getStepType = (index: number) => {
  const currentIndex = Math.floor(mockProgress.value / 25)
  if (index < currentIndex) return 'success'
  if (index === currentIndex) return 'primary'
  return 'info'
}

const getStepIcon = (index: number) => {
  const currentIndex = Math.floor(mockProgress.value / 25)
  if (index < currentIndex) return 'Check'
  if (index === currentIndex && isRunning.value) return 'Loading'
  return 'More'
}

const startWorkflow = () => {
  if (isRunning.value) return
  
  isRunning.value = true
  ElMessage.success('工作流程已開始')
  
  progressTimer = window.setInterval(() => {
    if (mockProgress.value < 100) {
      mockProgress.value += 2
      
      // 更新當前步驟
      const stepIndex = Math.floor(mockProgress.value / 25)
      if (stepIndex < workflowSteps.value.length) {
        currentStep.value = workflowSteps.value[stepIndex].title
      }
    } else {
      isRunning.value = false
      currentStep.value = '已完成'
      ElMessage.success('工作流程執行完成！')
      if (progressTimer) {
        clearInterval(progressTimer)
        progressTimer = null
      }
    }
  }, 100)
}

const pauseWorkflow = () => {
  if (!isRunning.value) return
  
  isRunning.value = false
  currentStep.value = '已暫停'
  ElMessage.warning('工作流程已暫停')
  
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const resetWorkflow = () => {
  isRunning.value = false
  mockProgress.value = 0
  currentStep.value = '準備中'
  ElMessage.info('工作流程已重置')
  
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

onMounted(() => {
  console.log('Mock Remote Component 已掛載')
})

onUnmounted(() => {
  if (progressTimer) {
    clearInterval(progressTimer)
  }
})
</script>

<style scoped>
.mock-remote-component {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 18px;
  color: #409eff;
}

.mock-content {
  margin-top: 20px;
}

.step-time {
  color: #909399;
  font-size: 12px;
}

/* 添加一些動畫效果 */
.el-progress {
  margin: 10px 0;
}

.el-timeline-item {
  transition: all 0.3s ease;
}
</style>
