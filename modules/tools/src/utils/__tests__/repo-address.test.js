const { getRepoSshAddress, isValidRepoSshAddress } = require('../repo-address')

describe.each`
  repoAddress                                      | expected
  ${'git@github.com:csssr-team/e2e-tools.git'}     | ${true}
  ${'git@github.com:csssr-team/e2e-tools'}         | ${true}
  ${'git@:csssr-team/e2e-tools'}                   | ${false}
  ${'https://github.com/csssr-team/e2e-tools.git'} | ${false}
  ${'github.com:csssr-team/e2e-tools.git'}         | ${false}
  ${undefined}                                     | ${false}
`('Ssh repo address validation', ({ repoAddress, expected }) => {
  it(`${repoAddress} is ${expected ? 'valid' : 'not valid'}`, () => {
    expect(isValidRepoSshAddress(repoAddress)).toBe(expected)
  })
})

describe('Gettings ssh repo address from package.json repository field', () => {
  it(`should get string repository value`, () => {
    expect(getRepoSshAddress('git@github.com:csssr-team/e2e-tools.git')).toBe(
      'git@github.com:csssr-team/e2e-tools.git'
    )
  })

  it(`should get { url: string } repository value`, () => {
    expect(getRepoSshAddress({ url: 'git@github.com:csssr-team/e2e-tools.git' })).toBe(
      'git@github.com:csssr-team/e2e-tools.git'
    )
  })

  it(`should convert https url to ssh`, () => {
    expect(getRepoSshAddress({ url: 'https://github.com/csssr-team/e2e-tools.git' })).toBe(
      'git@github.com:csssr-team/e2e-tools.git'
    )
  })

  it(`should convert git+https url to ssh`, () => {
    expect(getRepoSshAddress({ url: 'git+https://github.com/csssr-team/e2e-tools.git' })).toBe(
      'git@github.com:csssr-team/e2e-tools.git'
    )
  })

  it(`should return undefined for invalid urls`, () => {
    expect(getRepoSshAddress({ url: 'test' })).toBe(undefined)
  })
})
