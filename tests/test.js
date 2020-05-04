const { decode } = require('hyperid')
const hyperid = require('../')
const test = require('tape')

test('ready()', (t) => {
  hyperid.ready((err) => {
    t.error(err)
    t.end()
  })
})

test('generate()', (t) => {
  hyperid.ready((err) => {
    t.error(err)
    const hid = hyperid()
    t.ok(hid())
    t.ok('string' === typeof hid())
    t.ok(23 + 1, hid().length)
    t.ok(23 + 1, hid().length)
    t.ok(23 + 1, hid().length)
    t.ok(23 + 1, hid().length)
    t.ok(23 + 1, hid().length)
    t.ok(23 + 1, hid().length)
    t.ok(23 + 1, hid().length)
    t.ok(23 + 1, hid().length)
    t.ok(23 + 1, hid().length)
    t.ok(23 + 2, hid().length) // counter=10
    t.ok(23 + 2, hid().length) // counter=11
    t.end()
  })
})

test('generate() - start from', (t) => {
  hyperid.ready((err) => {
    t.error(err)
    const hid = hyperid({ startFrom: 102 })
    t.ok(hid())
    t.ok('string' === typeof hid())
    t.ok(hid().match(/104$/))
    t.ok(hid().match(/105$/))
    t.ok(hid().match(/106$/))
    t.ok(hid().match(/107$/))
    t.end()
  })
})

test('generate() - start from (fixed)', (t) => {
  hyperid.ready((err) => {
    t.error(err)
    const hid = hyperid({ startFrom: 100, fixedLength: true })
    t.ok(hid())
    t.ok('string' === typeof hid())
    t.ok(hid().match(/0000000102$/))
    t.ok(hid().match(/0000000103$/))
    t.ok(hid().match(/0000000104$/))
    t.ok(hid().match(/0000000105$/))
    t.end()
  })
})

test('generate() - fixed length', (t) => {
  hyperid.ready((err) => {
    t.error(err)
    const hid = hyperid({ fixedLength: true })
    t.ok(hid())
    t.ok('string' === typeof hid())
    t.ok(23 + 10, hid().length)
    t.ok(23 + 10, hid().length)
    t.ok(23 + 10, hid().length)
    t.ok(23 + 10, hid().length)
    t.end()
  })
})

test('generate() - url safe', (t) => {
  hyperid.ready((err) => {
    t.error(err)
    const hid = hyperid({ urlSafe: true })
    t.ok(hid().match(/-0$/))
    t.ok(hid().match(/-1$/))
    t.ok(hid().match(/-2$/))
    t.end()
  })
})

test('generate() - url safe (fixed length)', (t) => {
  hyperid.ready((err) => {
    t.error(err)
    const hid = hyperid({ urlSafe: true, fixedLength: true, startFrom: 100 })
    t.ok(hid().match(/-0000000100$/))
    t.ok(hid().match(/-0000000101$/))
    t.ok(hid().match(/-0000000102$/))
    t.end()
  })
})

test('generate() - validate', (t) => {
  hyperid.ready((err) => {
    t.error(err)
    t.ok(decode(hyperid({urlSafe: true, fixedLength: true, startFrom: 1024})(), { urlSafe: true }))
    t.ok(decode(hyperid({urlSafe: true, fixedLength: false, startFrom: 2 * 1024})(), { urlSafe: true }))
    t.ok(decode(hyperid({urlSafe: false, fixedLength: true, startFrom: 2})()))

    let max = 10
    let i = max
    const hid = hyperid({ fixedLength: true })
    while (--i) {
      const decoded = decode(hid())
      t.ok(decoded)
      t.equal(max - i - 1, decoded.count)
    }

    t.end()
  })
})
