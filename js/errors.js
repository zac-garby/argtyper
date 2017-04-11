exports.error = function (type, text, stacktrace=null) {
  if (stacktrace) {
    let str = `(${type}) ${text}`
    for (const item of stacktrace.reverse()) {
      str += `\n    of ${item}`
    }

    throw new Error(str + '\n    ---')
  }
  throw new Error(`(${type}) ${text}`)
}

exports.assert = function (truth, type, message, stacktrace=null) {
  if (!truth) {
    exports.error(type, message, stacktrace)
  }

  return { and: exports.assert }
}

exports.throws = function (fn, ...args) {
  try {
    fn(...args)
    return false
  } catch (e) {
    return true
  }
}
