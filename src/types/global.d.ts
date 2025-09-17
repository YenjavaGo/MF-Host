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

export {}
