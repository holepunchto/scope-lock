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
    if (this.locked === false && this.waiting.length === 0) return Promise.resolve()
    return this.wiggle()
  }

  destroy () {
    this.destroyed = true
    for (const w of this.waiting) w(false)
    this.skip = 0
    this.waiting = []
  }

  async wiggle () {
    if ((await this.lock()) === true) this.unlock()
  }

  lock () {
    const promise = new Promise(setTmpResolve)
    const resolve = tmpResolve

    tmpResolve = null

    if (this.destroyed) {
      resolve(false)
      return promise
    }

    if (this.locked === true) {
      this.waiting.push(resolve)
      return promise
    }

    this.locked = true
    resolve(true)

    return promise
  }

  unlock () {
    if (this.skip > 0) {
      for (let i = 0; i < this.skip; i++) {
        this.waiting[i](false)
      }

      this.waiting = this.waiting.slice(this.skip)
      this.skip = 0
    }

    if (this.waiting.length === 0) {
      this.locked = false
      return
    }

    const next = this.waiting.shift()
    if (this.debounce === true) this.skip = this.waiting.length

    next(true)
  }
}

function setTmpResolve (resolve) {
  tmpResolve = resolve
}
