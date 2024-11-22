# scope-lock

Some concurrency semantics around entering scopes

```
npm install scope-lock
```

## Usage

``` js
const ScopeLock = require('scope-lock')

// normal lock runs all entries in the lock list
const l = new ScopeLock()

await l.lock()
// ... do your thing
l.unlock()

// debounced lock runs first and last entry in the lock list
const d = new ScopeLock({ debounce: true }) // debounced lock

if (await d.lock()) {
  // if we get lock do our thing
}

// wait for all current work to drain
await d.flush()
```

## License

Apache-2.0
