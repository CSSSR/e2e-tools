# Атрибуты для поиска элементов

Для поиска элементов в тестах расставляются атрибуты `data-testid`.
Такое имя атрибута не случайное, `data-testid` используют [react-modal](https://github.com/reactjs/react-modal) и [testing-library](https://testing-library.com).

## Рекомендуемый формат локатора

Рекомендуется использовать описанный ниже формат локатора. Можно использовать любой другой. Главное, чтобы атрибуты были уникальные и не менялись после добавления.

В предлагаемом формате значение локатора должно соответствовать схеме `${Контекст}:${тип}:${опциональная уточняющая информация через точку}`.

Примеры:

- `MainPage:button:createNewModel`
- `ConsequenceForm:field:description`
- `ShowBarrierModal:modal`
- `BarrierForm:button:responsibles.add`
- `BarrierForm:field:cost.unit`

Варианты типов:

- `button`
- `field`
- `modal`
- `tag`
- `text`
- `dropdown`
- `link`
- `block` (используется, если не подошёл один из вариантов выше)
- Другие типы тоже можно использовать

Если надо отобразить обращение к массиву или к ключу объекта, то необходимо использовать квадратные скобки. Примеры:

- `Scheme:button:addBarrier.proactiveBarriers[1]`
- `ConsequenceForm:field:riskConsumers[0].amount`
- `ConsequenceForm:field:damageType[REPUTATION]`

По возможности надо избегать использования id элементов для `data-testid`, так как они могут инкрементироваться и не сохраняться от одного прогона тестов к другому. Вместо id можно использовать index или order.
