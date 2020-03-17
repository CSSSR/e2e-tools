/* eslint-disable func-names */
const Test = require('mocha/lib/test')
const commonInterface = require('mocha/lib/interfaces/common')

function withType(type, suiteOrTest) {
  suiteOrTest.testRailType = type
  return suiteOrTest
}

/**
 * TestRail-style interface:
 *
 *
 * ```js
 *  testcase('Authorization', function() {
 *    step('go to main page', function() {
 *      // ...
 *    });
 *
 *    expected('should have auth form with email and password fields', function() {
 *      // ...
 *    });
 *  });
 * ```
 *
 * @param {Suite} suite Root suite.
 */
module.exports = function bddInterface(rootSuite) {
  const suites = [rootSuite]

  rootSuite.on('pre-require', function(context, file, mocha) {
    const common = commonInterface(suites, context, mocha)

    context.before = common.before
    context.after = common.after
    context.beforeEach = common.beforeEach
    context.afterEach = common.afterEach
    context.run = mocha.options.delay && common.runWithSuite(rootSuite)

    /**
     * testcase
     */

    context.testcase = function(title, fn) {
      // хак для before/after хуков
      const fnWithGlobalHook = () => {
        if (global.runInTestcaseBody) {
          global.runInTestcaseBody()
        }

        fn()
      }

      const suite = common.suite.create({ title, file, fn: fnWithGlobalHook })

      suite.afterEach(function beforeEachHook(browser, done) {
        let isSuiteFailed = false
        this.test.parent.tests.forEach(test => {

          if (test.state === 'failed') {
            isSuiteFailed = true
          }

          if (isSuiteFailed && test.state === undefined) {
            test.pending = true
          }
        })

        done()
      })

      return withType('testcase', suite)
    }

    context.testcase.skip = function(title, fn) {
      return withType('testcase', common.suite.skip({ title, file, fn }))
    }

    context.testcase.only = function(title, fn) {
      return withType('testcase', common.suite.only({ title, file, fn }))
    }

    /**
     * step
     */

    context.step = function(title, fn) {
      const currentSuite = suites[0]
      if (currentSuite.isPending()) {
        fn = null
      }
      const test = new Test(title, fn)
      test.file = file
      currentSuite.addTest(test)
      return withType('step', test)
    }

    context.step.only = function(title, fn) {
      return common.test.only(mocha, context.step(title, fn))
    }

    context.xit = context.step.skip = function(title) {
      return context.step(title)
    }

    context.step.retries = function(n) {
      context.retries(n)
    }

    /**
     * expected
     */

    context.expected = function(title, fn) {
      const suite = suites[0]
      if (suite.isPending()) {
        fn = null
      }
      const test = new Test(title, fn)
      test.file = file
      suite.addTest(test)
      return withType('expected', test)
    }

    context.expected.only = function(title, fn) {
      return common.test.only(mocha, context.expected(title, fn))
    }

    context.xit = context.expected.skip = function(title) {
      return context.expected(title)
    }

    context.expected.retries = function(n) {
      context.retries(n)
    }
  })
}
