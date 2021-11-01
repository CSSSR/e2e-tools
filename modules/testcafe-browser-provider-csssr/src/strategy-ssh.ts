import { Strategy } from './strategy'
import net from 'net'
import { Client } from 'ssh2'
import pino from 'pino'
import { BrowserServerConfig } from './config'

export class SshStrategy implements Strategy {
  private forwardedPorts: number[] = []
  private sshConnection: Client
  private logger: pino.Logger
  private config: BrowserServerConfig

  constructor(logger: pino.Logger) {
    this.logger = logger
  }

  public async init(config: BrowserServerConfig): Promise<void> {
    this.config = config
    this.sshConnection = await this.tunnel()

    this.sshConnection.on('end', () => {
      this.logger.debug('ENDING SSH CONNECTION')
      process.exit(0)
    })

    this.sshConnection.on('tcp connection', (info, accept) => {
      this.logger.debug({ info }, 'Tcp connection')

      const stream = accept()
      stream.pause()

      const socket = net.connect(info.destPort, info.destIP, () => {
        stream.pipe(socket)
        socket.pipe(stream)
        stream.resume()
      })
    })
  }

  public async preOpenBrowser(id: string, pageUrl: string): Promise<void> {
    const u = new URL(pageUrl)

    const port = this.forwardedPorts.shift()
    if (port) {
      await this.unforward(port)
      await this.unforward(port + 1)
      this.logger.info({ port1: port, port2: port + 1 }, 'Unforward previos ports')
    }

    const port1 = parseInt(u.port)
    const port2 = port1 + 1
    await this.forward(port1)
    await this.forward(port2)
    this.logger.info({ port1, port2 }, 'Ports forwarded')
    this.forwardedPorts.push(port1)
    this.forwardedPorts.push(port2)
  }

  public async dispose() {
    this.logger.info({ ports: this.forwardedPorts }, 'Ports forwarded')
    for (let port of this.forwardedPorts) {
      await this.unforward(port)
    }
    this.sshConnection.end()
    this.logger.info('Ssh connection ended')
  }

  private async tunnel(): Promise<Client> {
    const settings = this.config.sshSettings
    if (!settings) {
      throw new Error('Ssh configuration not set')
    }
    if (!settings.port) {
      settings.port = 22
    }
    this.logger.info(settings, 'Ssh credentials')

    return new Promise((resolve) => {
      const conn = new Client()
      this.logger.info({}, 'Opening ssh tunnel')
      conn
        .on('ready', () => {
          this.logger.info('Tunnel ready')
          resolve(conn)
        })
        .connect(settings)
    })
  }

  private forward(port: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.sshConnection.forwardIn('127.0.0.1', port, async (err, port) => {
        this.logger.info({ port }, 'Forward in port completed')
        if (err) {
          this.logger.error(err, 'Forward in port error')
          reject(err)
        }
        resolve(true)
      })
    })
  }

  private unforward(port: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.sshConnection.unforwardIn('127.0.0.1', port, (err) => {
        if (err) {
          this.logger.error(err, 'Unforward in port error')
          reject(false)
        }
        this.logger.info({ port }, 'Unforward in port completed')
        resolve(true)
      })
    })
  }

  async postCloseBrowser(id: string) {}
}
