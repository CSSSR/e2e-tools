import { Strategy } from './strategy'
import { execSync, spawn } from 'child_process'
import hostile from 'hostile'
import kill from 'tree-kill'

function randomPort(): string {
  const between = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min)
  }

  return between(1024, 65535).toString()
}

interface TunnelInfo {
  svc: string
  process: any
}

const tunnels: Record<string, TunnelInfo> = {}

export class KtunnelStrategy implements Strategy {
  private namespace = 'selenium-tunnel'
  private logger

  constructor(logger) {
    this.logger = logger
  }

  public async init(config: BrowserServerConfig): Promise<void> {
    this.logger.info('INIT start')
    return new Promise((resolve) => resolve())
  }

  public async preOpenBrowser(id: string, pageUrl: string): Promise<void> {
    const u = new URL(pageUrl)
    this.logger.info(
      {
        page: pageUrl,
      },
      'PRE OPEN BROWSER'
    )

    return new Promise((resolve, reject) => {
      const svcName = `testcafe-${u.port}`
      const logger = this.logger.child({
        ktunnel: {
          svc: svcName,
          port: u.port,
        },
      })

      const child = spawn('ktunnel', [
        'expose',
        '--namespace',
        this.namespace,
        '-r',
        '-p',
        randomPort(), // todo get free port, look for errors in stderr and get another port
        svcName,
        `${u.port}:${u.port}`,
      ])

      tunnels[id] = {
        svc: svcName,
        process: child,
      }

      child.stdout.on('data', (data) => {
        logger.info(
          {
            pipe: 'stdout',
          },
          data.toString()
        )

        if (/starting tcp tunnel from source/.test(data.toString())) {
          logger.info('TUNNEL UP')
          resolve()
        }
      })

      child.stderr.on('data', (data) => {
        logger.info(
          {
            pipe: 'stderr',
          },
          data.toString()
        )
      })

      child.stdin.on('data', (data) => {
        logger.info(
          {
            pipe: 'stdin',
          },
          data.toString()
        )
      })
    })
  }

  async postCloseBrowser(id: string) {
    await this.clearTunnel(id)
  }

  async clearTunnel(id: string) {
    const logger = this.logger.child({
      func: 'clearTunnel',
    })

    if (tunnels[id]) {
      logger.info('Delete k8s resources')
      this.clearResources(tunnels[id].svc)

      const p = tunnels[id].process
      logger.info(
        {
          pid: p.pid,
        },
        'Stop ktunnel process'
      )
      kill(p.pid, 'SIGKILL', (err) => {
        logger.error(err, 'ERROR Killing process')
      })

      await this.clearHostRecord(`${tunnels[id].svc}.${this.namespace}.svc.cluster.local`, logger)
    }
  }

  private clearHostRecord(host, logger): Promise<void> {
    logger.info(
      {
        host,
      },
      'Remove record from hosts file'
    )

    return new Promise((resolve, reject) => {
      hostile.remove('127.0.0.1', host, (err) => {
        if (err) {
          logger.error(err, 'Failed remove host record')
          reject()
        }
        logger.info('Host record removed')
        resolve()
      })
    })
  }

  private clearResources(svcName: string) {
    execSync(`kubectl -n ${this.namespace} delete deployment ${svcName}`)
    execSync(`kubectl -n ${this.namespace} delete svc ${svcName}`)
  }

  async dispose() {}
}
