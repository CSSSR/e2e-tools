import pino from 'pino'
import { createWriteStream } from 'fs'
import { SshStrategy } from './strategy-ssh'
import { KtunnelStrategy } from './strategy-ktunnel'
import { Context } from './strategy'
import { configs, BrowserServerConfig } from './config'
const { getEnvVariable } = require('@csssr/e2e-tools/utils')

let ctx: Context
const level = process.env.DEBUG_LEVEL || 'error'
const logger = pino({ level })
let sessions: string[] = []

function getBasicAuthEnv(config, env, description) {
  const key = `${config.toUpperCase()}_${env}`
  const envValue = process.env[key]
  return envValue || getEnvVariable(key, description)
}

function browserConfiguration(browserName: string): BrowserServerConfig {
  const [config, browser] = browserName.split(':')

  if (!configs.hasOwnProperty(config)) {
    throw new Error(`Configuration for ${config} not found`)
  }

  const c = configs[config]
  c.browser = browser

  c.username = getBasicAuthEnv(config, 'USERNAME', `Login for ${c.baseURL}`)
  c.password = getBasicAuthEnv(config, 'PASSWORD', `Password for ${c.baseURL}`)

  if (c.serverType === 'ssh' && c.sshSettings) {
    c.sshSettings.username = getBasicAuthEnv(
      config,
      'SSH_USERNAME',
      `SSH login for ${c.sshSettings.host}`
    )
    c.sshSettings.password = getBasicAuthEnv(
      config,
      'SSH_PASSWORD',
      `SSH password for ${c.sshSettings.host}`
    )
  }

  return c
}

export async function openBrowser(id: string, pageUrl: string, browserName: string) {
  sessions.push(id)
  const config = browserConfiguration(browserName)
  const log = logger.child({ sessionId: id })
  log.info({ config }, 'Browser Configuration')

  switch (config.serverType) {
    case 'ssh':
      ctx = new Context(log, new SshStrategy(log.child({ tunnel: 'ssh' })))
      break
    case 'k8s':
      ctx = new Context(log, new KtunnelStrategy(log.child({ tunnel: 'ktunnel' })))
      break
    default:
      ctx = new Context()
  }

  await ctx.init(config)
  await ctx.preOpenBrowser(id, pageUrl)

  log.info({ pageUrl, browser: config.browser }, 'Open browser request')
  const resp = await ctx.api.post('/openBrowser', {
    id,
    pageUrl,
    browserName: config.browser,
    browserHandler: config.browserHandler,
    serverType: config.serverType,
  })

  log.info('Open browser request completed')
}

export async function closeBrowser(id: string) {
  const log = logger.child({ sessionId: id })

  const resp = await ctx.api.post('/closeBrowser', { id })
  log.info(
    {
      status: resp.status,
    },
    'Close browser request completed'
  )
  await ctx.postCloseBrowser(id)
  log.info('Post close browser hook completed')

  const index = sessions.findIndex((el) => {
    return el === id
  })
  if (typeof index !== 'undefined') {
    sessions.splice(index, 1)
  }

  log.info('Browser closed')
  setTimeout(checkGlobalDone, 3000)
}

async function checkGlobalDone() {
  if (sessions.length === 0) {
    ctx.dispose()
  }
}

export async function takeScreenshot(
  id: string,
  screenshotPath: string,
  pageWidth: number,
  pageHeight: number
): Promise<void> {
  const log = logger.child({ sessionId: id, func: 'screenshot' })
  log.info(
    {
      screenshotPath,
      pageWidth,
      pageHeight,
    },
    'Take screenshot started'
  )

  const w = createWriteStream(screenshotPath)
  const resp = await ctx.api.get(`/screenshot/${id}`, { responseType: 'stream' })

  resp.data.pipe(w)
  w.on('error', (err) => {
    log.error(err)
    w.close()
  })

  return new Promise((resolve) => {
    w.on('close', () => {
      log.info(`Screenshot saved to ${screenshotPath}`)
      resolve()
    })
  })
}

export async function getBrowserList() {
  // TODO list available browsers
}
