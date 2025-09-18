/**
 * 微前端載入工具類
 * 用於動態載入和管理微前端應用
 */

export interface MicrofrontendApp {
  name: string
  url: string
  module: string
  container?: HTMLElement
  loaded?: boolean
}

export interface MicrofrontendConfig {
  name: string
  url: string
  module: string
  props?: Record<string, any>
  onMount?: (app: any) => void
  onUnmount?: (app: any) => void
  onError?: (error: Error) => void
}

class MicrofrontendLoader {
  private loadedApps: Map<string, any> = new Map()
  private loadingApps: Set<string> = new Set()

  /**
   * 載入微前端應用
   * @param config 應用配置
   * @param container 容器元素
   */
  async loadApp(config: MicrofrontendConfig, container: HTMLElement): Promise<any> {
    const { name, url, module } = config

    // 防止重複載入
    if (this.loadingApps.has(name)) {
      throw new Error(`應用 ${name} 正在載入中`)
    }

    if (this.loadedApps.has(name)) {
      console.warn(`應用 ${name} 已經載入`)
      return this.loadedApps.get(name)
    }

    this.loadingApps.add(name)

    try {
      // 動態載入遠程模組
      const remoteApp = await this.loadRemoteModule(url, module)
      
      // 掛載應用
      let mountedApp
      if (remoteApp.mount) {
        mountedApp = await remoteApp.mount(container, config.props || {})
      } else if (remoteApp.default && remoteApp.default.mount) {
        mountedApp = await remoteApp.default.mount(container, config.props || {})
      } else {
        throw new Error(`應用 ${name} 沒有提供 mount 方法`)
      }

      this.loadedApps.set(name, {
        app: mountedApp,
        config,
        container,
        remoteModule: remoteApp
      })

      // 執行載入後回調
      if (config.onMount) {
        config.onMount(mountedApp)
      }

      console.log(`微前端應用 ${name} 載入成功`)
      return mountedApp

    } catch (error) {
      console.error(`載入微前端應用 ${name} 失敗:`, error)
      
      if (config.onError) {
        config.onError(error as Error)
      }
      
      throw error
    } finally {
      this.loadingApps.delete(name)
    }
  }

  /**
   * 卸載微前端應用
   * @param name 應用名稱
   */
  async unloadApp(name: string): Promise<void> {
    const appData = this.loadedApps.get(name)
    
    if (!appData) {
      console.warn(`應用 ${name} 未載入`)
      return
    }

    try {
      // 執行卸載方法
      if (appData.remoteModule.unmount) {
        await appData.remoteModule.unmount(appData.app)
      } else if (appData.remoteModule.default && appData.remoteModule.default.unmount) {
        await appData.remoteModule.default.unmount(appData.app)
      }

      // 清理容器
      if (appData.container) {
        appData.container.innerHTML = ''
      }

      // 執行卸載後回調
      if (appData.config.onUnmount) {
        appData.config.onUnmount(appData.app)
      }

      this.loadedApps.delete(name)
      console.log(`微前端應用 ${name} 卸載成功`)

    } catch (error) {
      console.error(`卸載微前端應用 ${name} 失敗:`, error)
      throw error
    }
  }

  /**
   * 載入遠程模組
   * @param url 遠程地址
   * @param module 模組名稱
   */
  private async loadRemoteModule(url: string, module: string): Promise<any> {
    try {
      // 使用 Webpack 5 Module Federation 載入遠程模組
      // 先嘗試直接通過 remote 名稱載入（推薦方式）
      const remoteName = this.extractRemoteName(url)
      
      if (remoteName) {
        try {
          // 動態載入已配置的 remote 模組
          const remoteModule = await import(/* webpackChunkName: "remote-[request]" */ `${remoteName}/${module.replace('./', '')}`)
          return remoteModule
        } catch (remoteError) {
          console.warn(`無法通過 remote 名稱載入 ${remoteName}/${module}，嘗試直接載入`, remoteError)
        }
      }
      
      // 備用方案：直接載入 remoteEntry.js
      const container = await import(/* webpackIgnore: true */ url)
      await container.init(__webpack_share_scopes__.default)
      const factory = await container.get(module)
      return factory()
    } catch (error) {
      console.error('載入遠程模組失敗:', error)
      throw new Error(`無法載入遠程模組 ${module} from ${url}`)
    }
  }

  /**
   * 從 URL 中提取 remote 名稱
   * @param url 遠程地址
   */
  private extractRemoteName(url: string): string | null {
    // 從 URL 中提取可能的 remote 名稱
    // 例如：http://localhost:3001/remoteEntry.js -> 檢查是否為已知的 remote
    const knownRemotes = ['workflow'] // 可以從 webpack 配置中動態獲取
    
    for (const remoteName of knownRemotes) {
      if (url.includes('3001') && remoteName === 'workflow') {
        return remoteName
      }
    }
    
    return null
  }

  /**
   * 檢查應用是否已載入
   * @param name 應用名稱
   */
  isAppLoaded(name: string): boolean {
    return this.loadedApps.has(name)
  }

  /**
   * 檢查應用是否正在載入
   * @param name 應用名稱
   */
  isAppLoading(name: string): boolean {
    return this.loadingApps.has(name)
  }

  /**
   * 獲取已載入的應用列表
   */
  getLoadedApps(): string[] {
    return Array.from(this.loadedApps.keys())
  }

  /**
   * 重新載入應用
   * @param name 應用名稱
   */
  async reloadApp(name: string): Promise<any> {
    const appData = this.loadedApps.get(name)
    
    if (!appData) {
      throw new Error(`應用 ${name} 未載入`)
    }

    // 先卸載再載入
    await this.unloadApp(name)
    return await this.loadApp(appData.config, appData.container)
  }

  /**
   * 清理所有應用
   */
  async cleanup(): Promise<void> {
    const appNames = this.getLoadedApps()
    
    for (const name of appNames) {
      try {
        await this.unloadApp(name)
      } catch (error) {
        console.error(`清理應用 ${name} 失敗:`, error)
      }
    }
  }
}

// 全域實例
export const microfrontendLoader = new MicrofrontendLoader()

// 預設匯出
export default microfrontendLoader
