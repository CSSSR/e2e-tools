import * as Mocha from 'mocha'

declare global {
  const testcase: Mocha.SuiteFunction
  const step: Mocha.TestFunction
  const expected: Mocha.TestFunction
}
