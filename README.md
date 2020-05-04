hyperid-wasm
============

> A HyperID implementation written in [ZZ][zz] compiled to WebAssembly (WASM) format

## Installation

### Node

```sh
$ npm install @little-core-labs/hyperid-wasm
```

### WAPM

```sh
$ wapm install jwerle/hyperid-wasm
```

## Usage

```js
const hyperid = require('hyperid-wasm')

hyperid.ready(() => {
  const hid = hyperid({ fixedLength: true, startFrom: 1024 })
  console.log(hid()) // atd1gpRDT1SJZnaOhdLR5Q/0000001024
  console.log(hid()) // atd1gpRDT1SJZnaOhdLR5Q/0000001025
})
```

## API

### `generator = hyperid([opts])`

Create a new `hyperid` generator where `opts` is the same arguments
given to the original [hyperid][hyperid].

```js
const generator = hyperid({
  fixedLength: false, // use a fixed length counter
  startFrom: 0, // initial counter value
  urlSafe: false, // use URL safe characters
})
```

### `id = generator()`

Generate a hyperid from `hyperid` context. (See above)

```js
const id = generator()
```

## Benchmark

This original module is ~4x faster than this one.

```
hyperid generate - variable length (original) x 11,024,841 ops/sec ±0.83% (89 runs sampled)
hyperid generate - variable length (wasm) x 3,545,414 ops/sec ±0.93% (89 runs sampled)
hyperid generate - fixed length (original) x 9,288,525 ops/sec ±1.39% (88 runs sampled)
hyperid generate - fixed length (wasm) x 3,264,580 ops/sec ±0.95% (91 runs sampled)
```

## Limits

### Initial Memory

By default, this module allocates 2 pages of memory for the WebAssembly module.
That is `2 * 64 * 1024` bytes.

### Maximum Memory

This module allows at most 256 pages of memory. That is `256 * 64 *
1024` bytes.

## See Also

* https://github.com/mcollina/hyperid

## License

MIT

[zz]: https://github.com/zetzit/zz
[hyperid]: https://github.com/mcollina/hyperid
