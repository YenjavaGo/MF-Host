<template>
  <div id="app">
    <!-- 頂部導航欄 -->
    <el-header class="header">
      <div class="header-content">
        <h1 class="title">
          <el-icon><Grid /></el-icon>
          {{ $t('app.title') }}
        </h1>
        <div class="nav-section">
          <el-menu 
            mode="horizontal" 
            class="nav-menu"
            :default-active="activeMenu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              {{ $t('nav.home') }}
            </el-menu-item>
            <el-menu-item index="/remote-apps">
              <el-icon><Connection /></el-icon>
              {{ $t('nav.remoteApps') }}
            </el-menu-item>
            <el-menu-item index="/ctbc-workflow">
              <el-icon><Monitor /></el-icon>
              CTBC Workflow
            </el-menu-item>
          </el-menu>
          
          <div class="header-tools">
            <el-dropdown @command="handleLanguageChange">
              <el-button text>
                <el-icon><Setting /></el-icon>
                {{ currentLanguage }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="zh-TW">繁體中文</el-dropdown-item>
                  <el-dropdown-item command="en">English</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            
            <el-switch
              v-model="isDark"
              @change="toggleTheme"
              inline-prompt
              :active-icon="Moon"
              :inactive-icon="Sunny"
              active-text="深色"
              inactive-text="淺色"
            />
          </div>
        </div>
      </div>
    </el-header>

    <!-- 主要內容區域 -->
    <el-container class="main-container">
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>

    <!-- 底部資訊 -->
    <el-footer class="footer">
      <div class="footer-content">
        <p>&copy; 2024 {{ $t('footer.copyright') }}</p>
      </div>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { 
  Grid, 
  House, 
  Connection, 
  Setting,
  ArrowDown,
  Moon,
  Sunny,
  Monitor
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const { locale, t } = useI18n()

const isDark = ref(false)

const activeMenu = computed(() => route.path)

const currentLanguage = computed(() => {
  return locale.value === 'zh-TW' ? '繁中' : 'EN'
})

const handleMenuSelect = (index: string) => {
  router.push(index)
}

const handleLanguageChange = (command: string) => {
  locale.value = command as 'zh-TW' | 'en'
  localStorage.setItem('language', command)
}

const toggleTheme = (value: boolean) => {
  if (value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', value ? 'dark' : 'light')
}

onMounted(() => {
  // 恢復語言設定
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage) {
    locale.value = savedLanguage as 'zh-TW' | 'en'
  }
  
  // 恢復主題設定
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

<style scoped>
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微軟雅黑', Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  height: 60px;
  line-height: 60px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-menu {
  background: transparent;
  border: none;
}

.nav-menu .el-menu-item {
  color: white;
  border: none;
}

.nav-menu .el-menu-item:hover,
.nav-menu .el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.header-tools {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-tools .el-button {
  color: white;
}

.header-tools .el-button:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.main-container {
  flex: 1;
  background-color: var(--el-bg-color-page);
  transition: background-color 0.3s;
}

.main-content {
  padding: 20px;
}

.footer {
  background-color: var(--el-color-info-dark-2);
  color: var(--el-color-white);
  height: 50px;
  line-height: 50px;
  text-align: center;
  transition: background-color 0.3s;
}

.footer-content p {
  margin: 0;
  font-size: 14px;
}

/* 深色模式支援 */
:global(.dark) {
  .main-container {
    background-color: var(--el-bg-color-page);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
  
  .title {
    font-size: 18px;
    margin-bottom: 10px;
  }
  
  .nav-section {
    width: 100%;
    justify-content: space-between;
  }
  
  .header-tools {
    gap: 8px;
  }
  
  .main-content {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .nav-section {
    flex-direction: column;
    gap: 10px;
  }
  
  .header-tools {
    justify-content: center;
  }
}
</style>
