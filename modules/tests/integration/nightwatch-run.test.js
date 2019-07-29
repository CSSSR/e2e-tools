const { setupEnvironment } = require('./helpers')

describe('nightwatch:run command', () => {
  it('Generated examples should run successfully', () => {
    const { run } = setupEnvironment('nightwatch-run')

    run('init')
    run('add-tool @csssr/e2e-tools-nightwatch')

    run('nightwatch:run')
  })
})
