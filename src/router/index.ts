import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import RemoteApps from '@/views/RemoteApps.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首頁'
    }
  },
  {
    path: '/remote-apps',
    name: 'RemoteApps',
    component: RemoteApps,
    meta: {
      title: '微前端應用'
    }
  },
  {
    path: '/ctbc-workflow',
    name: 'CTBCWorkflow',
    component: () => import('@/views/CTBCWorkflow.vue'),
    meta: {
      title: 'CTBC 工作流程管理系統'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守衛
router.beforeEach((to, from, next) => {
  // 設置頁面標題
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 微前端Host應用`
  }
  next()
})

export default router
