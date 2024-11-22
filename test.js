const test = require('brittle')
const ScopeLock = require('./')

test('basic lock', function (t) {
  t.plan(5)

  let tick = 0
  const l = new ScopeLock()

  run(0)
  run(1)
  run(2)
  run(3)
  run(4)

  async function run (expected) {
    await l.lock()

    t.is(tick, expected)
    tick++

    l.unlock()
  }
})

test('basic debounced lock', async function (t) {
  t.plan(2)

  const trace = []
  const l = new ScopeLock({ debounce: true })

  run(0)
  run(1)
  run(2)
  run(3)
  run(4)

  t.is(await l.lock(), false)
  t.alike(trace, [0, 1])

  async function run (input) {
    if ((await l.lock()) === false) return

    trace.push(input)

    l.unlock()
  }
})
