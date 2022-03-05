const fs = require('fs')
const path = require('path')
const {
  getConfig,
  getProjectRootDir,
  createWorkflow,
  getGitHubBrowserSecretEnv,
  allurectlWatch,
  allurectlUploadStep,
  allureEnv,
  downloadAllurectlStep,
} = require('@csssr/e2e-tools/utils')

function generateGitHubWorkflow() {
  const config = getConfig()
  const nightwatchConfig = config.tools['@csssr/e2e-tools-nightwatch']

  const githubWorkflowPath = path.join(
    getProjectRootDir(),
    '.github/workflows/run-nightwatch-tests.yaml'
  )
  if (!nightwatchConfig.githubActions?.enabled) {
    fs.rmSync(githubWorkflowPath, { force: true })
    return
  }

  const githubSecretsEnv = getGitHubBrowserSecretEnv(nightwatchConfig.browsers)

  const defaultRemoteBrowser = Object.entries(nightwatchConfig.browsers)
    .filter(([_, cfg]) => cfg.remote)
    .map(([browserName]) => browserName)[0]

  function slackMessage(status) {
    function byStatus(success, failure) {
      return status === 'success' ? success : failure
    }

    return {
      'slack-bot-user-oauth-access-token': '${{ secrets.SLACK_SEND_MESSAGE_TOKEN }}',
      'slack-channel': nightwatchConfig.githubActions?.slackChannel,
      'slack-text': [
        byStatus(
          ':approved: *Тесты прошли успешно*',
          ':fire: *${{ steps.allure.outputs.report-failed-percentage }}% (${{ steps.allure.outputs.report-failed-total }}) тестов упало*'
        ),
        '',
        `Название: Run tests`,
        'URL: ${{ github.event.inputs.launchUrl }}',
        'Команда для запуска:',
        '```',
        'yarn et nightwatch:run --browser ${{ github.event.inputs.browserName }} --checkScreenshots=${{ github.event.inputs.checkScreenshots }}',
        '```',
        '',
        '*Allure отчёт*: ${{ steps.allure.outputs.report-link }}',
        '',
        '${{ steps.allure.outputs.report-summary }}',
        '',
        'Логи: https://github.com/${{ github.repository }}/runs/${{ steps.query-jobs.outputs.result }}?check_suite_focus=true',
        '',
        `https://s.csssr.ru/U09LGPMEU/${byStatus(
          '20200731115845',
          '20200731115800'
        )}.jpg?run=\${{ github.run_id }}`,
      ].join('\n'),
    }
  }
  const name = 'Run Nightwatch e2e tests'

  const workflowContent = {
    name,
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
          checkScreenshots: {
            description: 'Проверка скриншотов',
            default: 'true',
            required: true,
          },
        },
      },
    },
    permissions: {
      actions: 'read',
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
    jobs: {
      'run-tests': {
        name: 'Run tests',
        'runs-on': ['self-hosted', 'e2e-tests'],
        'timeout-minutes': 90,
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
          config.allure?.projectId && downloadAllurectlStep(),
          {
            run: allurectlWatch(
              config,
              `yarn et nightwatch:run --browser \${{ github.event.inputs.browserName }} --checkScreenshots=\${{ github.event.inputs.checkScreenshots }}`
            ),
            'working-directory': 'e2e-tests',
            env: {
              ...githubSecretsEnv,
              LAUNCH_URL: '${{ github.event.inputs.launchUrl }}',
              ENABLE_ALLURE_REPORT: 'true',
              ...allureEnv(
                config,
                `${name} in \${{ github.event.inputs.browserName }}`,
                'nightwatch'
              ),
            },
          },
          {
            if: 'always()',
            name: 'Generate Allure report',
            run: `node -e 'require("@csssr/e2e-tools/upload-allure-report")'`,
            'working-directory': 'e2e-tests',
            id: 'allure',
            env: {
              LAUNCH_URL: '${{ github.event.inputs.launchUrl }}',
              RUN_COMMAND: `yarn et nightwatch:run --browser \${{ github.event.inputs.browserName }} --checkScreenshots=\${{ github.event.inputs.checkScreenshots }}`,
              ALLURE_REPORT_DIRECTORIES:
                'codecept/report/allure-reports/,nightwatch/report/allure-reports/',
              AWS_ACCESS_KEY_ID: '${{ secrets.TEST_REPORTS_AWS_ACCESS_KEY_ID }}',
              AWS_SECRET_ACCESS_KEY: '${{ secrets.TEST_REPORTS_AWS_SECRET_ACCESS_KEY }}',
            },
          },
          nightwatchConfig.githubActions?.slackChannel && {
            if: 'always()',
            uses: 'actions/github-script@v4',
            id: 'query-jobs',
            with: {
              script: [
                'const result = await github.actions.listJobsForWorkflowRun({',
                '  owner: context.repo.owner,',
                '  repo: context.repo.repo,',
                '  run_id: ${{ github.run_id }},',
                '})',
                'return result.data.jobs[0].id',
              ].join('\n'),
              'result-encoding': 'string',
            },
          },

          nightwatchConfig.githubActions?.slackChannel && {
            if: 'failure()',
            name: 'Send failure to Slack',
            uses: 'archive/github-actions-slack@27663f2377ce6f86d7fca5b8056e6b977f03b5c9',
            with: slackMessage('failure'),
          },
          nightwatchConfig.githubActions?.slackChannel && {
            if: 'success()',
            name: 'Send success to Slack',
            uses: 'archive/github-actions-slack@27663f2377ce6f86d7fca5b8056e6b977f03b5c9',
            with: slackMessage('success'),
          },
          allurectlUploadStep(config, name, 'nightwatch'),
        ].filter(Boolean),
      },
    },
  }

  createWorkflow(githubWorkflowPath, workflowContent)
}

module.exports = { generateGitHubWorkflow }
