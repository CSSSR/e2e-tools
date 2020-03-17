# Nightwatch Image Comparison

Nightwatch assertions to compare screenshots in your tests.
Currently under development and contains a bunch of hardcoded options. Do not use yet, but please let me know if you want too.

## Credits

The module is now based on [webdriver-image-comparison module](https://github.com/wswebcreation/webdriver-image-comparison).
Thanks a lot [Wim Selles](https://github.com/wswebcreation) for creating and open sourcing it!

## Setting up

1. Install module `npm install --save-dev @csssr/nightwatch-image-comparison`
2. Configure module in `nightwatch.conf.js`

```js
const path = require('path')
const nightwatchImageComparison = require('@csssr/nightwatch-image-comparison')

module.exports = {
  globals: {
    screenshots: {
      testsRootDir: path.join(__dirname, 'tests'), // required
      screenshotsRootDir: path.join(__dirname, 'screenshots'), // required
      skipScreenshotAssertions: false, // default: false
    },
  },
  custom_assertions_path: [nightwatchImageComparison.assertionsPath],
}
```

## Usage examples

Making screenshot of all page

```js
browser.assert.screenshotPage('full authorization page')
```

Make a screenshot of element with selector `[data-test-id="auth-form"]`

```js
browser.assert.screenshotElement(
  '[data-test-id="auth-form"]',
  'Authorization form before filling: every field is empty'
)
```

Specifing allowed mismatch percentage. Try not to use it because it can lead to missing unexpected changes.

```js
browser.assert.screenshotElement(
  '[data-test-id="confirm-registration-form"]',
  'Confirmation form: fields are empty, submit button is disabled',
  {
    // Rendering in IE is slightly different every time
    allowedMisMatchPercentage: 0.5, // 0,5%
  }
)
```

Hide some selectors before taking screenshot

```js
browser.assert.screenshotElement(
  '[data-test-id="confirm-registration-form"]',
  'форма подтверждения регистрации: поля не заполнены, кнопка отправки задизейблена',
  {
    hideSelectors: [
      // Email is different every test run (created randomly)
      '[data-test-id="auth-form-email-field"]',
    ],
  }
)
```

## Best practices

- It's best to describe expected screenshot content. It will help to validate screenshots on code review.
- Use [Git LFS](https://git-lfs.github.com) to store images in repository
