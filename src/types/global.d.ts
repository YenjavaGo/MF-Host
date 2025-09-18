// 全域型別定義

declare global {
  interface Window {
    __MICRO_APP_ENVIRONMENT__: boolean
  }

  const __webpack_share_scopes__: {
    default: any
  }
}

// Module Federation 型別
declare module '*remoteEntry.js' {
  const content: {
    get: (module: string) => () => Promise<any>
    init: (shareScope: any) => Promise<void>
  }
  export default content
}

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

// Webpack Module Federation 全域變數聲明
declare global {
  const __webpack_init_sharing__: ((scope: string) => Promise<void>) | undefined
  const __webpack_share_scopes__: any
  interface Window {
    __webpack_init_sharing__?: (scope: string) => Promise<void>
    __webpack_share_scopes__?: any
    mf_host?: any
    workflow?: any
    webpackChunkmf_host?: any[]
    webpackChunkvue_flow_app?: any[]
  }
}

export {}
