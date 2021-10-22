import axios from 'axios'
import { BrowserServerConfig } from './config'

export interface Strategy {
  init(config: BrowserServerConfig): Promise<void>
  dispose(): Promise<void>
  preOpenBrowser(id: string, pageUrl: string): Promise<void>
  postCloseBrowser(id: string): Promise<void>
}

export class Context {
  private strategy: Strategy | undefined
  private isInitialized: boolean = false
  private logger
  public api: any

  constructor(logger?, strategy?: Strategy) {
    this.strategy = strategy
    this.logger = logger
  }

  public async init(config: BrowserServerConfig): Promise<void> {
    if (!this.isInitialized) {
      this.logger.info('Init phase')
      if (!config.username || !config.password) {
        throw new Error(`Credentials for ${config.baseURL} not set`)
      }

      this.api = axios.create({
        baseURL: config.baseURL,
        auth: {
          username: config.username,
          password: config.password,
        },
      })

      if (this.strategy) {
        await this.strategy.init(config)
      }
      this.isInitialized = true
    }
  }

  public async dispose() {
    if (this.strategy) {
      await this.strategy.dispose()
    }
  }

  public preOpenBrowser(id: string, pageUrl: string): Promise<void> {
    return this.strategy
      ? this.strategy.preOpenBrowser(id, pageUrl)
      : new Promise((resolve) => resolve())
  }

  public postCloseBrowser(id: string): Promise<void> {
    return this.strategy ? this.strategy.postCloseBrowser(id) : new Promise((resolve) => resolve())
  }
}
