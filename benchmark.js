const { Suite } = require('benchmark')
const hyperid = require('hyperid')
const wasm = require('./')

const suite = new Suite()

const variable = {
  hyperid: hyperid(),
  wasm: wasm()
}

const fixed = {
  hyperid: hyperid({ fixedLength: true }),
  wasm: wasm({ fixedLength: true })
}

suite.add('hyperid generate - variable length (original)', () => {
  variable.hyperid()
})

suite.add('hyperid generate - variable length (wasm)', () => {
  variable.wasm()
})

suite.add('hyperid generate - fixed length (original)', () => {
  fixed.hyperid()
})

suite.add('hyperid generate - fixed length (wasm)', () => {
  fixed.wasm()
})

suite.on('cycle', oncycle)
suite.run()

function oncycle(e) {
  console.log(e.target.toString())
}
