const debug = require('../utils/debug')(__filename)
const ikv = require('../cores/interfaces/kv')
const imeta = require('../cores/interfaces/meta')
const { createNewCore } = require('../cores/create_core')
const loadCore = require('../cores/load_core')

exports.create = function (storage, keys, callback) {
  debug('[META] creating new meta core')
  createNewCore('meta', storage, keys, (err, core) => {
    if (err) return callback(err)

    // This is where a good old hypercore turns into meta-core
    applyInterface(ikv, core)
    applyInterface(imeta, core)

    // It's likely we want to use the same storage used here with
    // new cores so let's make our lives easier
    core.default_storage = storage

    callback(err, core)
  })
}

exports.open = function (storage, keys, callback) {
  debug('Open meta core', keys.key)
  loadCore(keys, storage, (err, core) => {
    if (err) return callback(err)

    if (core) {
      // This is where a good old hypercore turns into meta-core
      applyInterface(ikv, core)
      applyInterface(imeta, core)

      // It's likely we want to use the same storage used here with
      // new cores so let's make our lives easier
      core.default_storage = storage
      return callback(err, core)
    } else {
      return callback()
    }
  })
}

function applyInterface (interf, core) {
  for (const method in interf) {
    if (interf.hasOwnProperty(method)) {
      core[method] = interf[method](core)
    }
  }
  return core
}
