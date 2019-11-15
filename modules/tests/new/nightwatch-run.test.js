const { createInitedApp } = require('./test-utils')

const answers = {
  launchUrl: 'github.com',
  projectName: 'github',
}

describe('nightwatch:run', () => {
  it('run', async () => {
    const app = await createInitedApp({ answers })
      .then(app => app.run('add-tool @csssr/e2e-tools-nightwatch'))
      .then(app => app.run('nightwatch:run'))

    expect(app.nightwatch).toBeCalledTimes(1)
    expect(app.nightwatch).toBeCalledWith([
      'nightwatch',
      '--env',
      'local_chrome',
      '--config',
      '/node_modules/@csssr/e2e-tools-nightwatch/config',
    ])
  })
})
