const { setupEnvironment } = require('./helpers')

describe('nightwatch:run command', () => {
  const { run } = setupEnvironment('nightwatch-run')

  run('init')
  run('add-tool @nitive/e2e-tools-nightwatch', {
    promptResults: {
      defaultLaunchUrl: 'github.com',
      projectName: 'github',
      repoSshAddress: 'git@github.com:github/web.git',
    },
  })

  it('Generated examples should run successfully', async () => {
    run('nightwatch:run')
  })
})
