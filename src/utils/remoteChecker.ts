/**
 * 遠程應用狀態檢查工具
 */

export interface RemoteStatus {
  name: string
  url: string
  available: boolean
  error?: string
  responseTime?: number
}

export class RemoteChecker {
  /**
   * 檢查遠程應用是否可用
   */
  async checkRemoteStatus(name: string, url: string): Promise<RemoteStatus> {
    const startTime = Date.now()
    
    try {
      console.log(`檢查遠程應用狀態: ${name} - ${url}`)
      
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      })
      
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        return {
          name,
          url,
          available: true,
          responseTime
        }
      } else {
        return {
          name,
          url,
          available: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      return {
        name,
        url,
        available: false,
        error: errorMessage,
        responseTime
      }
    }
  }

  /**
   * 批量檢查多個遠程應用
   */
  async checkMultipleRemotes(remotes: Array<{name: string, url: string}>): Promise<RemoteStatus[]> {
    const promises = remotes.map(remote => 
      this.checkRemoteStatus(remote.name, remote.url)
    )
    
    return Promise.all(promises)
  }
}

export const remoteChecker = new RemoteChecker()
export default remoteChecker
