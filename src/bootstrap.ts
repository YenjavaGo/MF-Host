import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// Element Plus 相關導入
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhTw from 'element-plus/es/locale/lang/zh-tw'

// 建立Vue應用實例
const app = createApp(App)

// 使用路由
app.use(router)

// 使用國際化
app.use(i18n)

// 使用Element Plus並設定繁體中文
app.use(ElementPlus, {
  locale: zhTw,
})

// 註冊所有Element Plus圖標
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component as any)
}

// 全域屬性
app.config.globalProperties.$ELEMENT = {
  size: 'default',
  zIndex: 3000
}

// 掛載應用
app.mount('#app')

console.log('微前端Host應用已啟動 - Vue 3 + Module Federation + Element Plus + TypeScript')
