/**
 * 是否有值
 * @param {*} val
 */
export function isDef(val) {
  return val !== undefined && val !== null
}

/**
 * 创建一个 Web Work 实例
 * @param func
 */
export function createWorker(func) {
  const blob = new Blob(['(' + func.toString() + ')()'])
  const url = window.URL.createObjectURL(blob)
  const worker = new Worker(url)

  window.URL.revokeObjectURL(url)

  return worker
}

export function createWorkerFunc() {
  let timer
  let options

  self.onmessage = function (event) {
    let code = event.data['code']
    options = Object.assign({}, options, event.data['data'])
    const { htmlFileUrl, lastEtag, appETagKey, immediate, pollingInterval } =
      options

    const runReq = function () {
      fetch(htmlFileUrl, {
        method: 'HEAD',
        cache: 'no-cache',
      }).then(function (response) {
        const etag = response.headers.get('etag')

        if (lastEtag !== etag) {
          self.postMessage({
            appETagKey,
            lastEtag,
            etag,
          })
        }
      })
    }

    if (code === 'pause') {
      clearInterval(timer)
      timer = null
    } else {
      immediate && runReq()
      timer = setInterval(runReq, pollingInterval)
    }
  }

  return self
}

export function closeWorker(worker) {
  worker.terminate()
}
