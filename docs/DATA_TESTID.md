## Атрибуты для поиска элементов

Для поиска элементов в тестах на элементы расставляются атрибут data-testid.
Такое имя атрибута неслучайное, data-testid использует [react-modal](https://github.com/reactjs/react-modal) и [testing-library](https://testing-library.com).

### Рекомендуемый формат локатора

Рекомендуется использовать формат локатора, выработанный командой МПСС. Впрочем, это необязательное условие, главное, чтобы атрибуты были более менее уникальные и не менялись после добавления.

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

Если надо отобразить обращение к массиву или к ключу объекта, то используем квадратные скобки. Примеры:

- `Scheme:button:addBarrier.proactiveBarriers[1]`
- `ConsequenceForm:field:riskConsumers[0].amount`
- `ConsequenceForm:field:damageType[REPUTATION]`
