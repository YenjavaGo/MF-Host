// Module Federation 類型聲明文件

// Workflow Remote 應用的模組類型聲明
declare module 'workflow/flowManager' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 通用 Workflow 遠程模組聲明
declare module 'workflow/*' {
  const module: any
  export default module
  export const [key: string]: any
}

// 其他可能的遠程應用
declare module '*/remoteEntry' {
  const remoteEntry: any
  export default remoteEntry
}

// Module Federation 容器類型
declare global {
  interface Window {
    // Module Federation 運行時可能添加的全局變數
    __webpack_share_scopes__?: any
    __webpack_init_sharing__?: any
  }
}

export {}
