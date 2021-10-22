export interface BrowserServerConfig {
  os: 'macos' | 'linux' | 'windows'
  browser?: string
  browserHandler: 'testcafe' | 'webdriver'
  serverType: 'ssh' | 'k8s' | 'local'
  baseURL: string
  username?: string
  password?: string
  sshSettings?: {
    host: string
    port?: number
    username?: string
    password?: string
  }
}

export const configs: Record<string, BrowserServerConfig> = {
  macmini: {
    os: 'macos',
    baseURL: 'https://macmini.browser-server.csssr.cloud',
    browserHandler: 'webdriver',
    serverType: 'ssh',
    sshSettings: {
      host: 'j10-2.macminivault.com',
    },
  },
  'remote-chrome': {
    os: 'linux',
    serverType: 'k8s',
    browserHandler: 'webdriver',
    baseURL: 'https://chrome.headless.csssr.cloud',
  },
  'remote-firefox': {
    os: 'linux',
    serverType: 'k8s',
    browserHandler: 'webdriver',
    baseURL: 'https://firefox.headless.csssr.cloud',
  },
}
