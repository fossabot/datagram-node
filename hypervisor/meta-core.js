const debug = require("../utils/debug")(__filename)
const kv_ui = require("../cores/interfaces/kv")
const meta_ui = require("../cores/interfaces/meta")
const { createNewCore } = require("../cores/create_core")
const load_core = require("../cores/load_core")

exports.create = function(storage, keys, callback) {
  debug("[META] creating new meta core")
  createNewCore("meta", storage, keys, (err, core) => {
    if (err) return callback(err)

    // This is where a good old hypercore turns into meta-core
    applyInterface(kv_ui, core)
    applyInterface(meta_ui, core)

    // It's likely we want to use the same storage used here with
    // new cores so let's make our lives easier
    core.default_storage = storage

    callback(err, core)
  })
}

exports.open = function(storage, keys, callback) {
  debug("Open meta core", keys.key)
  load_core(keys, storage, (err, core) => {
    if (err) return callback(err)

    if (core) {
      // This is where a good old hypercore turns into meta-core
      applyInterface(kv_ui, core)
      applyInterface(meta_ui, core)

      // It's likely we want to use the same storage used here with
      // new cores so let's make our lives easier
      core.default_storage = storage
      return callback(err, core)
    } else {
      return callback()
    }
  })
}

function applyInterface(interface, core) {
  for (const method in interface) {
    if (interface.hasOwnProperty(method)) {
      core[method] = interface[method](core)
    }
  }
  return core
}
