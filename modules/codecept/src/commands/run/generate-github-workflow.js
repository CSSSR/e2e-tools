const fs = require('fs')
const path = require('path')
const glob = require('fast-glob')
const crypto = require('crypto')
const {
  allurectlWatch,
  allureEnv,
  downloadAllurectlStep,
  getConfig,
  getTestsRootDir,
  getProjectRootDir,
  createWorkflow,
  getGitHubSecretEnv,
} = require('@csssr/e2e-tools/utils')

function getTestFilePrettyName(testFile) {
  return testFile.replace(/\.test\.[jt]s$/, '')
}

function getJobName(testFile) {
  const hash = crypto.createHash('sha256').update(testFile, 'utf8').digest('hex')
  return `run-test-${hash}`
}

function generateGitHubWorkflow() {
  const config = getConfig()
  const codeceptConfig = config.tools['@csssr/e2e-tools-codecept']
  const githubWorkflowPath = path.join(
    getProjectRootDir(),
    '.github/workflows/run-codecept-tests.yaml'
  )
  if (!codeceptConfig.githubActions?.enabled) {
    fs.rmSync(githubWorkflowPath, { force: true })
    return
  }

  const githubSecretsEnv = getGitHubSecretEnv(codeceptConfig.browsers)
  const testFiles = glob.sync('**/*.test.{js,ts}', {
    cwd: path.join(getTestsRootDir(), 'codecept/tests'),
  })

  const defaultRemoteBrowser = Object.entries(codeceptConfig.browsers)
    .filter(([_, cfg]) => cfg.remote)
    .map(([browserName]) => browserName)[0]

  function getTestRunJob(testFile) {
    return {
      name: getTestFilePrettyName(testFile),
      if: `github.event.inputs.${getJobName(testFile)} == 'true'`,
      'runs-on': ['self-hosted', 'e2e-tests'],
      'timeout-minutes': 30,
      steps: [
        {
          uses: 'actions/checkout@v2',
          with: {
            lfs: true,
          },
        },
        {
          run: 'yarn install --frozen-lockfile',
          'working-directory': 'e2e-tests',
        },
        {
          run: `yarn et codecept:run --browser \${{ github.event.inputs.browserName }} --test 'tests/${testFile}'`,
          'working-directory': 'e2e-tests',
          env: {
            ...githubSecretsEnv,
            LAUNCH_URL: '${{ github.event.inputs.launchUrl }}',
          },
        },
      ],
    }
  }

  const workflowContent = {
    name: 'Run CodeceptJS e2e tests',
    concurrency: 'e2e-tests',
    on: {
      workflow_dispatch: {
        inputs: {
          launchUrl: {
            description: 'Базовый URL сайта',
            default: config.defaultLaunchUrl,
            required: true,
          },
          browserName: {
            description: 'Название браузера как в e2e-tools.json',
            default: defaultRemoteBrowser,
            required: true,
          },

          ...Object.fromEntries(
            testFiles.map((testFile) => [
              getJobName(testFile),
              {
                description: `Запустить тест «${getTestFilePrettyName(testFile)}»`,
                required: false,
                default: 'true',
              },
            ])
          ),
        },
      },
    },
    permissions: {
      actions: 'none',
      checks: 'none',
      contents: 'read',
      deployments: 'none',
      issues: 'none',
      packages: 'none',
      'pull-requests': 'none',
      'repository-projects': 'none',
      'security-events': 'none',
      statuses: 'none',
    },
    jobs: Object.fromEntries(
      testFiles.map((testFile) => [getJobName(testFile), getTestRunJob(testFile)])
    ),
  }

  createWorkflow(githubWorkflowPath, workflowContent)
}

module.exports = { generateGitHubWorkflow }
