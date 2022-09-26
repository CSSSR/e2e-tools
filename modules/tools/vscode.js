const uniqBy = require('lodash/uniqBy')
const fs = require('fs')
const path = require('path')
const { updateJsonFile, getTestsRootDir } = require('@csssr/e2e-tools/utils')

function updateVsCodeConfig({ frameworkName, runCommand, tasks = [], inputs = [] }) {
  const vscodeTasksFilePath = path.join(getTestsRootDir(), '.vscode/tasks.json')

  if (!fs.existsSync(vscodeTasksFilePath)) {
    fs.mkdirSync(path.dirname(vscodeTasksFilePath), { recursive: true })
    fs.writeFileSync(vscodeTasksFilePath, '{}', { encoding: 'utf-8' })
  }

  updateJsonFile({
    filePath: vscodeTasksFilePath,
    update(config) {
      return {
        ...config,
        tasks: uniqBy(
          [
            ...(config.tasks || []),
            ...tasks,
            {
              type: 'shell',
              label: `${frameworkName}: запустить текущий файл в Chrome локально`,
              command: `yarn et ${runCommand} --browser local_chrome --test='\${file}'`,
              problemMatcher: [],
              presentation: {
                showReuseMessage: false,
              },
              group: 'build',
            },
            {
              type: 'shell',
              label: `${frameworkName}: запустить testcase текущего файла в Chrome локально`,
              command: `yarn et ${runCommand} --browser local_chrome --test='\${file}' --testcase='\${input:testcase}'`,
              problemMatcher: [],
              presentation: {
                showReuseMessage: false,
              },
              group: 'build',
            },
            {
              type: 'shell',
              label: `${frameworkName}: запустить текущий файл в Chrome на удалённом сервере`,
              command: `yarn et ${runCommand} --browser remote_chrome --test='\${file}'`,
              problemMatcher: [],
              presentation: {
                showReuseMessage: false,
              },
              group: 'build',
            },
            {
              type: 'shell',
              label: `${frameworkName}: запустить testcase текущего файла в Chrome на удалённом сервере`,
              command: `yarn et ${runCommand} --browser remote_chrome --test='\${file}' --testcase='\${input:testcase}'`,
              problemMatcher: [],
              presentation: {
                showReuseMessage: false,
              },
              group: 'build',
            },
            {
              type: 'shell',
              label: `${frameworkName}: запустить все тесты в текущей папке в Chrome на удалённом сервере`,
              command: `yarn et ${runCommand} --browser remote_chrome --test='\${fileDirname}/*.test.js'`,
              problemMatcher: [],
              presentation: { showReuseMessage: false },
              group: 'build',
            },
            {
              type: 'shell',
              label: `${frameworkName}: запустить все тесты в текущей папке рекурсивно в Chrome на удалённом сервере`,
              command: `yarn et ${runCommand} --browser remote_chrome --test='\${fileDirname}/**/*.test.js'`,
              problemMatcher: [],
              presentation: { showReuseMessage: false },
              group: 'build',
            },
            {
              type: 'shell',
              label: `${frameworkName}: запустить все тесты в Chrome на удалённом сервере`,
              command: `yarn et ${runCommand} --browser remote_chrome`,
              problemMatcher: [],
              presentation: { showReuseMessage: false },
              group: 'build',
            },
            {
              type: 'shell',
              label: 'Обновить @csssr/e2e-tools',
              command: 'yarn et upgrade',
              problemMatcher: [],
              group: 'build',
            },
          ],
          (task) => task.label
        ),
        inputs: uniqBy(
          [
            ...(config.inputs || []),
            ...inputs,
            {
              id: 'testcase',
              type: 'promptString',
              description: 'Имя запускаемого testcase',
            },
          ],
          (input) => input.id
        ),
      }
    },
  })
}

module.exports = { updateVsCodeConfig }
