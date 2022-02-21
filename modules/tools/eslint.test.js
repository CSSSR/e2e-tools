const { eitherLatinOrCyrillicRegex } = require('./eslint-helpers')

describe('Регулярка для линтинга имен файлов и директорий (без расширений!)', () => {
  const regex = new RegExp(eitherLatinOrCyrillicRegex)
  it('кириллица', () => {
    expect(regex.test('абвгдАБВГД')).toBe(true)
  })

  it('латиница', () => {
    expect(regex.test('abcdeABCDE')).toBe(true)
  })

  it('пробелы в названии', () => {
    expect(regex.test('Тесты для регресса')).toBe(true)
  })

  it('нижнее подчеркивание в названии', () => {
    expect(regex.test('tests_for_regress')).toBe(true)
  })

  it('дефис в названии', () => {
    expect(regex.test('tests-for-regress')).toBe(true)
  })

  it('дефис, пробел и нижнее подчеркивание в названии', () => {
    expect(regex.test('tests for_regress-')).toBe(true)
  })

  it('цифры в названии', () => {
    expect(regex.test('01 Тесты для регресса')).toBe(true)
  })

  it('смесь кириллицы и латиницы 1', () => {
    expect(regex.test('pageОbjects')).toBe(false)
  })

  it('смесь кириллицы и латиницы 2', () => {
    expect(regex.test('Файл с тecстами')).toBe(false)
  })

  it('.eslint.js', () => {
    expect(regex.test('.eslint.js')).toBe(true)
  })

  it('файлы тестов, латиница', () => {
    expect(regex.test('File with tests.test')).toBe(true)
  })

  it('файлы тестов, кириллица', () => {
    expect(regex.test('Файл с тестами.test')).toBe(true)
  })
})
