<template>
  <div class="home-content">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Star /></el-icon>
          <span>{{ $t('home.welcome') }}</span>
        </div>
      </template>
      
      <div class="welcome-content">
        <el-alert
          :title="$t('home.projectInfo')"
          type="info"
          :closable="false"
          show-icon
        >
          <p><strong>{{ $t('home.techStack') }}：</strong>{{ $t('app.description') }}</p>
          <p><strong>{{ $t('home.features') }}：</strong>作為微前端架構的Host應用，可以動態載入其他微前端應用</p>
        </el-alert>

        <div class="feature-grid">
          <el-card class="feature-card" v-for="feature in features" :key="feature.key">
            <div class="feature-content">
              <el-icon class="feature-icon" :class="feature.iconClass">
                <component :is="feature.icon" />
              </el-icon>
              <h3>{{ $t(`home.${feature.key}.title`) }}</h3>
              <p>{{ $t(`home.${feature.key}.description`) }}</p>
            </div>
          </el-card>
        </div>

        <!-- 快速入口 -->
        <el-card class="quick-entry-card">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Compass /></el-icon>
              <span>快速入口</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="entry-card" shadow="hover" @click="goToRemoteApps">
                <div class="entry-content">
                  <el-icon class="entry-icon"><Connection /></el-icon>
                  <h4>微前端應用管理</h4>
                  <p>管理和載入微前端應用模組</p>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="entry-card ctbc-entry" shadow="hover" @click="goToCTBCWorkflow">
                <div class="entry-content">
                  <el-icon class="entry-icon"><Monitor /></el-icon>
                  <h4>CTBC 工作流程系統</h4>
                  <p>中國信託工作流程管理系統</p>
                  <el-tag type="success" size="small" class="entry-tag">推薦</el-tag>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>

        <!-- 系統狀態 -->
        <el-card class="status-card">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><Monitor /></el-icon>
              <span>系統狀態</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic title="Vue版本" :value="parseFloat(vueVersion)" :value-style="{ color: '#409eff' }" suffix="版本" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="Element Plus版本" :value="parseFloat(elementPlusVersion)" :value-style="{ color: '#67c23a' }" suffix="版本" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="運行時間" :value="uptime" suffix="秒" />
            </el-col>
          </el-row>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { version } from 'vue'
import { 
  Star, 
  Monitor, 
  Setting, 
  DataBoard,
  Connection,
  Compass
} from '@element-plus/icons-vue'

interface Feature {
  key: string
  icon: string
  iconClass: string
}

const router = useRouter()
const vueVersion = ref(version)
const elementPlusVersion = ref('2.4.4') // Element Plus 版本
const uptime = ref(0)
let timer: number | null = null

const goToRemoteApps = () => {
  router.push('/remote-apps')
}

const goToCTBCWorkflow = () => {
  router.push('/ctbc-workflow')
}

const features: Feature[] = [
  {
    key: 'feature1',
    icon: 'Monitor',
    iconClass: 'vue-icon'
  },
  {
    key: 'feature2',
    icon: 'Connection',
    iconClass: 'federation-icon'
  },
  {
    key: 'feature3',
    icon: 'Setting',
    iconClass: 'element-icon'
  },
  {
    key: 'feature4',
    icon: 'DataBoard',
    iconClass: 'dynamic-icon'
  }
]

onMounted(() => {
  timer = window.setInterval(() => {
    uptime.value++
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.home-content {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  margin-bottom: 20px;
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

.welcome-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.feature-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-content {
  text-align: center;
  padding: 20px;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.vue-icon {
  color: #4fc08d;
}

.federation-icon {
  color: #8dd6f9;
}

.element-icon {
  color: #409eff;
}

.dynamic-icon {
  color: #67c23a;
}

.feature-content h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 18px;
}

.feature-content p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.status-card {
  margin-top: 20px;
}

.quick-entry-card {
  margin: 20px 0;
}

.entry-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 120px;
}

.entry-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.ctbc-entry {
  border: 2px solid #67c23a;
}

.ctbc-entry:hover {
  border-color: #409eff;
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
}

.entry-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
  justify-content: center;
  position: relative;
}

.entry-icon {
  font-size: 32px;
  color: #409eff;
  margin-bottom: 8px;
}

.ctbc-entry .entry-icon {
  color: #67c23a;
}

.entry-content h4 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.entry-content p {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.entry-tag {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
