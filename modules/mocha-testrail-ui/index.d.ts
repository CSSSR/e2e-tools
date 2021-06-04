import * as Mocha from 'mocha'

interface Store {
  [key: string]: any;
}

declare global {
  const testcase: Mocha.SuiteFunction
  const step: Mocha.TestFunction
  const expected: Mocha.TestFunction
  const store: Store;
}
