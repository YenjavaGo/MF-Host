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
import { version } from 'vue'
import { 
  Star, 
  Monitor, 
  Setting, 
  DataBoard,
  Connection
} from '@element-plus/icons-vue'

interface Feature {
  key: string
  icon: string
  iconClass: string
}

const vueVersion = ref(version)
const elementPlusVersion = ref('2.4.4') // Element Plus 版本
const uptime = ref(0)
let timer: number | null = null

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

/* 響應式設計 */
@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
