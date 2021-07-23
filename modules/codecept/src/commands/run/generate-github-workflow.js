const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const glob = require('fast-glob')
const crypto = require('crypto')
const { getConfig, getTestsRootDir, getProjectRootDir } = require('@csssr/e2e-tools/utils')

function getGitHubSecretEnv(browsers) {
  return Object.entries(browsers)
    .filter(
      ([_, browserConfig]) => browserConfig.type === 'selenium' && browserConfig.seleniumBasicAuth
    )
    .reduce((acc, [browserName, browserConfig]) => {
      const sba = browserConfig.seleniumBasicAuth
      const usernameEnvName = `${browserName.toUpperCase()}_${sba.username_env}`
      const usernameGitHubSecret = sba.username_github_secret || sba.username_env
      const passwordEnvName = `${browserName.toUpperCase()}_${sba.password_env}`
      const passwordGitHubSecret = sba.password_github_secret || sba.password_env
      return {
        ...acc,
        [usernameEnvName]: `\${{ secrets.${usernameGitHubSecret} }}`,
        [passwordEnvName]: `\${{ secrets.${passwordGitHubSecret} }}`,
      }
    }, {})
}

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

  const githubWorkflowContent =
    '# Этот файл сгенерирован автоматически, не редактируйте его вручную\n\n' +
    yaml.dump(
      {
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
      },
      { noCompatMode: true, noRefs: true, lineWidth: -1 }
    )

  fs.mkdirSync(path.dirname(githubWorkflowPath), { recursive: true })
  fs.writeFileSync(githubWorkflowPath, githubWorkflowContent, { encoding: 'utf-8' })
}

module.exports = { generateGitHubWorkflow }
