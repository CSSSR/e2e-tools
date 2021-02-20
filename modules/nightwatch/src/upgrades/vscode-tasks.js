const uniqBy = require('lodash/uniqBy')
const path = require('path')
const { updateJsonFile, getTestsRootDir } = require('@csssr/e2e-tools/utils')

function updateVsCodeTasks() {
  updateJsonFile({
    filePath: path.join(getTestsRootDir(), '.vscode/tasks.json'),
    update(config) {
      return {
        ...config,
        tasks: uniqBy(
          [
            ...config.tasks,
            {
              type: 'shell',
              label: 'Nightwatch: запустить текущий файл в Chrome локально',
              command: "yarn et nightwatch:run --browser local_chrome --test='${file}'",
              problemMatcher: [],
              presentation: {
                showReuseMessage: false,
              },
              group: 'build',
            },
            {
              type: 'shell',
              label: 'Nightwatch: запустить testcase текущего файла в Chrome локально',
              command:
                "yarn et nightwatch:run --browser local_chrome --test='${file}' --testcase='${input:testcase}'",
              problemMatcher: [],
              presentation: {
                showReuseMessage: false,
              },
              group: 'build',
            },
            {
              type: 'shell',
              label: 'Nightwatch: запустить текущий файл в Chrome на удалённом сервере',
              command: "yarn et nightwatch:run --browser remote_chrome --test='${file}'",
              problemMatcher: [],
              presentation: {
                showReuseMessage: false,
              },
              group: 'build',
            },
            {
              type: 'shell',
              label: 'Nightwatch: запустить testcase текущего файла в Chrome на удалённом сервере',
              command:
                "yarn et nightwatch:run --browser remote_chrome --test='${file}' --testcase='${input:testcase}'",
              problemMatcher: [],
              presentation: {
                showReuseMessage: false,
              },
              group: 'build',
            },
            {
              type: 'shell',
              label: 'Nightwatch: запустить все тесты в Chrome на удалённом сервере',
              command: 'yarn et nightwatch:run --browser remote_chrome',
              problemMatcher: [],
              presentation: { showReuseMessage: false },
              group: 'build',
            },
            {
              type: 'shell',
              label: 'Nightwatch: Открыть HTML отчёт о последнем прогоне',
              command: 'open nightwatch/report/mochawesome.html',
              windows: {
                command: 'explorer nightwatch/report\\mochawesome.html',
              },
              problemMatcher: [],
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
            ...config.inputs,
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

module.exports = { updateVsCodeTasks }
