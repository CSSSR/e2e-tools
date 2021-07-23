const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const glob = require('fast-glob')
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
  return testFile.replace(/^tests\//, '').replace(/\.test\.[jt]s$/, '')
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
  const testFiles = glob.sync('*.test.{js,ts}', {
    cwd: path.join(getTestsRootDir(), 'codecept/tests'),
  })

  const defaultRemoteBrowser = Object.entries(codeceptConfig.browsers)
    .filter(([_, cfg]) => cfg.remote)
    .map(([browserName]) => browserName)[0]

  function getTestRunJob(testFile) {
    return {
      'runs-on': ['self-hosted', 'e2e-tests'],
      steps: [
        {
          uses: 'actions/checkout@v2',
          with: {
            lfs: true,
          },
        },
        {
          uses: 'actions/setup-node@v2',
          with: {
            'node-version': '14',
            cache: 'yarn',
          },
        },
        {
          run: 'yarn install --frozen-lockfile',
          'working-directory': 'e2e-tests',
        },
        {
          run: `yarn et codecept:run --browser \${{ github.event.inputs.browserName }} --test '${testFile}'`,
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
        name: 'Run e2e tests',
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
                  `test-${getTestFilePrettyName(testFile)}`,
                  {
                    description: `Запустить тест «${getTestFilePrettyName(testFile)}»`,
                    required: false,
                    default: 'yes',
                  },
                ])
              ),
            },
          },
        },
        permissions: {
          actions: 'none', // read|write|none
          checks: 'none', // read|write|none
          contents: 'read', // read|write|none
          deployments: 'none', // read|write|none
          issues: 'none', // read|write|none
          packages: 'none', // read|write|none
          'pull-requests': 'none', // read|write|none
          'repository-projects': 'none', // read|write|none
          'security-events': 'none', // read|write|none
          statuses: 'none', // read|write|none
        },
        jobs: Object.fromEntries(
          testFiles.map((testFile) => [getTestFilePrettyName(testFile), getTestRunJob(testFile)])
        ),
      },
      { noCompatMode: true, noRefs: true, lineWidth: -1 }
    )

  fs.mkdirSync(path.dirname(githubWorkflowPath), { recursive: true })
  fs.writeFileSync(githubWorkflowPath, githubWorkflowContent, { encoding: 'utf-8' })
}

module.exports = { generateGitHubWorkflow }
