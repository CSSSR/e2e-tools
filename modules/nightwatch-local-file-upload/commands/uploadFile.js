const Events = require('events')
const path = require('path')
const archiver = require('archiver')

module.exports = class CustomPause extends Events {
  command(inputSelector, filePath, cb) {
    if (!inputSelector || !filePath) {
      return this
    }

    const uploadRemote = (cb) => {
      let buffers = []
      let zip = archiver('zip')
      zip
        .on('data', (data) => {
          buffers.push(data)
        })
        .on('error', (err) => {
          throw err
        })
        .on('finish', () => {
          const file = Buffer.concat(buffers).toString('base64')
          this.api.session((session) => {
            const opt = {
              path: `/session/${session.sessionId}/file`,
              method: 'POST',
              data: { file },
            }
            this.client.transport
              .runProtocolAction(opt)
              .then((result) => cb(result))
              .catch((err) => {
                console.error(err)
                throw err
              })
          })
        })

      const name = path.basename(filePath)
      zip.file(filePath, { name })
      zip.finalize()
    }

    uploadRemote((result) => {
      this.api.setValue(inputSelector, result.value, () => {
        if (cb) {
          cb.call(this.api)
        }

        this.emit('complete')
      })
    })
  }
}
