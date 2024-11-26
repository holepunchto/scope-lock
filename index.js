let tmpResolve = null

module.exports = class ScopeLock {
  constructor ({ debounce = false } = {}) {
    this.debounce = debounce
    this.waiting = []
    this.locked = false
    this.skip = 0
    this.destroyed = false
  }

  flush () {
    if (this.locked === false && this.waiting.length === 0) return Promise.resolve(this.destroyed === false)

    const promise = new Promise(setTmpResolve)
    const resolve = tmpResolve

    tmpResolve = null
    this.waiting.push({ lock: false, resolve })

    return promise
  }

  destroy () {
    this.destroyed = true
  }

  lock () {
    const promise = new Promise(setTmpResolve)
    const resolve = tmpResolve

    tmpResolve = null

    if (this.locked === true) {
      this.waiting.push({ lock: true, resolve })
      return promise
    }

    if (this.destroyed === true) {
      resolve(false)
      return promise
    }

    this.locked = true
    resolve(true)

    return promise
  }

  unlock () {
    if (this.destroyed === true) {
      for (let i = 0; i < this.waiting.length; i++) {
        this.waiting[i].resolve(false)
      }
      this.waiting = []
      this.skip = 0
      this.locked = false
      return
    }

    if (this.skip !== 0) {
      for (let i = 0; i < this.skip; i++) {
        const { lock, resolve } = this.waiting[i]
        resolve(lock === false)
      }

      this.waiting = this.waiting.slice(this.skip)
      this.skip = 0
    }

    while (this.waiting.length > 0 && this.waiting[0].lock === false) {
      this.waiting.shift().resolve(true)
    }

    if (this.waiting.length === 0) {
      this.locked = false
      return
    }

    const { resolve } = this.waiting.shift()
    if (this.debounce === true) this.skip = this.waiting.length

    resolve(true)
  }
}

function setTmpResolve (resolve) {
  tmpResolve = resolve
}
