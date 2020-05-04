const { parse } = require('uuid-parse')
const hyperid = require('hyperid')
const uuid = require('uuid')
const path = require('path')
const test = require('tape')
const fs = require('fs')

function load(callback) {
  const filename = path.resolve(__dirname, '..', 'hyperid.wasm')
  const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 })

  let wasi = null

  fs.readFile(filename, onread)

  function onread(err, buffer) {
    if (err) { return callback(err) }

    const imports = {
      env: {
        memory,
        uuid_generate(ptr) {
          const buffer = Buffer.from(memory.buffer).slice(ptr, ptr + 16)
          Buffer.from(parse(uuid.v4())).copy(buffer)
        }
      }
    }

    WebAssembly.instantiate(buffer, imports).then(onwasm, onerror)
  }

  function onwasm(wasm) {
    const { instance } = wasm
    callback(null, instance, wasm.instance.exports.memory || memory)
  }

  function onerror(err) {
    callback(err)
  }
}

test('basic', (t) => {
  load((err, mod, memory) => {
    t.error(err)

    const {
      hyperid_result_encoding_length,
      hyperid_generate,
      hyperid_count,
      hyperid_make,

      sizeof_hyperid_Context,
      sizeof_hyperid_Options,
      sizeof_hyperid_Result,

      __heap_base
    } = mod.exports

    const pointer = __heap_base + 0
    const heap = Buffer.from(memory.buffer)

    const contextSize = Number(sizeof_hyperid_Context)
    const contextPointer = pointer + 0
    const contextBuffer = heap.slice(contextPointer, contextPointer + contextSize)

    const optionsSize = Number(sizeof_hyperid_Options)
    const optionsPointer = contextPointer + contextSize
    const optionsBuffer = heap.slice(optionsPointer, optionsPointer + optionsSize)

    const outputSize = hyperid_result_encoding_length()
    const outputPointer = optionsPointer + optionsSize
    const outputBuffer = heap.slice(outputPointer, outputPointer + outputSize)

    // fixed_length
    optionsBuffer[0] = 1
    // url_safe
    optionsBuffer[1] = 1

    hyperid_make(contextPointer, 0, optionsPointer)
    t.equal(0, hyperid_count(contextPointer))

    t.equal(1, contextBuffer.slice(16)[0])
    t.equal(1, contextBuffer.slice(16)[1])

    const size = hyperid_generate(contextPointer, outputPointer)
    const result = outputBuffer.slice(0, size).toString()
    const decoded = hyperid.decode(result, {urlSafe: true})

    t.ok(decoded)
    t.equal(0, decoded.count)

    // url_safe
    optionsBuffer[1] = 1

    hyperid_make(contextPointer, 2048, optionsPointer)
    t.equal(2048, hyperid_count(contextPointer))

    const size2 = hyperid_generate(contextPointer, outputPointer)
    const result2 = outputBuffer.slice(0, size2).toString()
    const decoded2 = hyperid.decode(result2, {urlSafe: true})

    t.ok(decoded2)
    t.equal(2048, decoded2.count)

    t.end()
  })
})

