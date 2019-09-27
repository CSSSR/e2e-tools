const url = require('url')

function parseRemote(remoteUrl) {
  const _remoteUrl = remoteUrl.replace(/^git@/, 'ssh://git@')
  const parsedUrl = url.parse(_remoteUrl)
  const host = parsedUrl.host
  const path = parsedUrl.path.replace(/^\/\:?/, '')
  return { host, path }
}

function toSSH(remoteUrl) {
  const parsedRemote = parseRemote(remoteUrl)

  if (parsedRemote.host && parsedRemote.path) {
    return `git@${parsedRemote.host}:${parsedRemote.path}`
  }

  return undefined
}

function isValidRepoSshAddress(address) {
  if (typeof address === 'string' && address.startsWith('git@')) {
    const parsed = parseRemote(address)
    return !!(parsed.host && parsed.path)
  }

  return false
}

function getRepositoryUrl(repository) {
  if (typeof repository === 'string') {
    return repository
  }

  if (repository && typeof repository.url === 'string') {
    return repository.url
  }

  return undefined
}

function getRepoSshAddress(repository) {
  const repositoryUrl = getRepositoryUrl(repository)

  if (repositoryUrl) {
    return toSSH(repositoryUrl)
  }

  return undefined
}

module.exports = { getRepoSshAddress, isValidRepoSshAddress }
