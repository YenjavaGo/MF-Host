/**
 * 簡化的遠程模組載入器
 * 專門用於載入已在 webpack 中配置的 remote 應用
 */

export interface RemoteAppConfig {
  name: string
  remoteName: string  // webpack 中配置的 remote 名稱
  module: string      // 要載入的模組路徑
  container: HTMLElement
}

export class RemoteLoader {
  private loadedApps: Map<string, any> = new Map()

  /**
   * 載入遠程 Vue 組件
   */
  async loadRemoteComponent(config: RemoteAppConfig): Promise<any> {
    const { name, remoteName, module, container } = config

    try {
      console.log(`載入遠程組件: ${remoteName}/${module}`)

      // 使用動態 import 載入已配置的 remote 模組
      const moduleKey = module.startsWith('./') ? module.slice(2) : module
      const remoteModule = await import(/* webpackChunkName: "remote-[request]" */ `${remoteName}/${moduleKey}`)
      
      // 取得 Vue 組件
      const Component = remoteModule.default || remoteModule

      if (!Component) {
        throw new Error(`無法從 ${remoteName}/${module} 取得組件`)
      }

      console.log(`成功載入遠程組件:`, Component)

      // 儲存載入的組件
      this.loadedApps.set(name, {
        component: Component,
        container,
        config
      })

      return Component

    } catch (error) {
      console.error(`載入遠程組件失敗:`, error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`載入 ${remoteName}/${module} 失敗: ${errorMessage}`)
    }
  }

  /**
   * 卸載遠程組件
   */
  unloadRemoteComponent(name: string): void {
    const appData = this.loadedApps.get(name)
    
    if (appData && appData.container) {
      // 清理容器
      appData.container.innerHTML = ''
    }

    this.loadedApps.delete(name)
    console.log(`遠程組件 ${name} 已卸載`)
  }

  /**
   * 檢查組件是否已載入
   */
  isLoaded(name: string): boolean {
    return this.loadedApps.has(name)
  }

  /**
   * 取得已載入的組件
   */
  getLoadedComponent(name: string): any {
    const appData = this.loadedApps.get(name)
    return appData?.component
  }
}

// 全域實例
export const remoteLoader = new RemoteLoader()

export default remoteLoader
