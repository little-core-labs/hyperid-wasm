const createHyperid = require('./hyperid')
const { parse } = require('uuid-parse')
const assert = require('nanoassert')
const uuid = require('uuid')

const WASM_NOT_LOADED_ERR = 'hyperid-wasm has not loaded yet.'
const BYTES_PER_PAGE = 64 * 1024
const MAX_PAGES = 256

let alloc_base = 0

const memory = new WebAssembly.Memory({ initial: 4, maximum: MAX_PAGES })
const wasm = createHyperid({
  imports: { env: { memory, uuid_generate } }
})

const promise = new Promise((resolve, reject) => {
  wasm.onload((err) => {
    // istanbul ignore next
    if (err) { return reject(err) }
    resolve()
  })
})

function uuid_generate(ptr) {
  const buffer = Buffer.from(memory.buffer).slice(ptr, ptr + 16)
  Buffer.from(parse(uuid.v4())).copy(buffer)
}

function pointer(offset) {
  return wasm.exports.__heap_base + alloc_base + (offset || 0)
}

// istanbul ignore next
function deref(offset, size) {
  return Buffer.from(memory.buffer).slice(offset || 0, size ? offset + size : undefined)
}

// istanbul ignore next
function grow(size) {
  const needed = Math.ceil(Math.abs(size - memory.buffer.byteLength) / BYTES_PER_PAGE)
  memory.grow(Math.max(0, needed))
}

function lock(size) {
  alloc_base += size
}

function audit(size) {
  const pages = memory.buffer.byteLength / BYTES_PER_PAGE
  const needed = Math.floor((memory.buffer.byteLength + size) / BYTES_PER_PAGE)

  // istanbul ignore next
  if (size && needed > pages) {
    grow(size)
  }

  return Buffer.from(memory.buffer)
}

function toBuffer(buffer, size, offset) {
  // istanbul ignore next
  if (!Buffer.isBuffer(buffer)) {
    return Buffer.alloc(size)
  } else {
    // istanbul ignore next
    return buffer.slice(offset || 0)
  }
}

async function ready(callback) {
  // istanbul ignore next
  if ('function' === typeof callback) {
    try {
      await promise
    } catch (err) {
      // istanbul ignore next
      return void callback(err)
    }

    callback(null)
  }
  return promise
}

function hyperid(opts) {
  if (!opts || 'object' !== typeof opts) {
    opts = {}
  }

  assert(wasm.exports, WASM_NOT_LOADED_ERR)

  const contextSize = Number(wasm.exports.sizeof_hyperid_Context)
  const optionsSize = Number(wasm.exports.sizeof_hyperid_Options)
  const outputSize = wasm.exports.hyperid_result_encoding_length()

  audit(contextSize + optionsSize + outputSize)

  const contextPointer = pointer(0)
  const contextBuffer = deref(contextPointer, contextSize)

  const optionsPointer = pointer(contextPointer + contextSize)
  const optionsBuffer = deref(optionsPointer, optionsSize)

  const outputPointer = pointer(optionsPointer + optionsSize)
  const outputBuffer = deref(outputPointer, outputSize)

  if (opts.fixedLength) {
    // fixed_length
    optionsBuffer[0] = 1
  }

  if (opts.urlSafe) {
    // url_safe
    optionsBuffer[1] = 1
  }

  wasm.exports.hyperid_make(contextPointer, opts.startFrom || 0, optionsPointer)

  lock(contextSize + optionsSize + outputSize)

  return generate

  function generate() {
    const size = wasm.exports.hyperid_generate(contextPointer, outputPointer)
    return outputBuffer.slice(0, size).toString()
  }
}

module.exports = Object.assign(hyperid, {
  ready
})
