exports.getElement = (client, selector) => {
  return new Promise(resolve => {
    client.element('css selector', selector, result => {
      resolve(result.value)
    })
  })
}

exports.getElements = (client, selector) => {
  return new Promise(resolve => {
    client.elements('css selector', selector, result => {
      resolve(result.value)
    })
  })
}

exports.getElementsBySelectors = async (client, selectors) => {
  const elementsGroupedBySelector = await Promise.all(
    selectors.map(selector => this.getElements(client, selector))
  )

  return elementsGroupedBySelector.reduce(
    (allElements, selectorElements) => allElements.concat(selectorElements),
    []
  )
}
