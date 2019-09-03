const fs = require('fs')
const path = require('path')
const { setupEnvironment } = require('./helpers')

describe('nightwatch:run command', () => {
  const { run, rootDir } = setupEnvironment('nightwatch-run')

  run('init')
  run('add-tool @csssr/e2e-tools-nightwatch', {
    promptResults: {
      launchUrl: 'github.com',
      projectName: 'github',
      repositorySshAddress: 'git@github.com:github/web.git',
    },
  })

  it('Generated examples should run successfully', async () => {
    fs.writeFileSync(
      path.join(rootDir, 'e2e-tests/.env'),
      `LAUNCH_URL=<value>
       CHROMEDRIVER_USERNAME=<value>
       CHROMEDRIVER_PASSWORD=<value>
      `
    )
    run('nightwatch:run')
  })
})
