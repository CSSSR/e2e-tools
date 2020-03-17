/* eslint-disable no-param-reassign */

exports.addAssertionMethods = function addAssertionMethods(self, description) {
  self.message = 'Unexpected error'
  self.expected = () => {
    'Screenshot does match'
  }

  self.pass = value => {
    if (value.status === 'error') {
      const misMatchPercentage = value.result && value.result.misMatchPercentage
      if (misMatchPercentage) {
        self.message = `${description} не совпадает с базовым изображением. Разница: ${misMatchPercentage}%`
      } else if (value.error) {
        self.message = `${value.error} (${description})`
      } else {
        console.log('Value:', value)
        self.message = `Unexpected value (${description})`
      }
    }

    return value.status !== 'error'
  }

  self.value = result => result
}
