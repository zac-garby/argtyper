const assert = require('../errors').assert

exports.ArrayType = class ArrayType {
  constructor (...elements) {
    this.elements = elements
    this.name = 'array'
  }

  toString () {
    return this.elements.reduce((acc, val, i) => {
      return acc + (i > 0 ? ', ' : '') + val
    }, '[') + ']'
  }

  check (args, stacktrace) {
    assert(args.length > 0, 'Type', `Expected at least one more value to match ${this}`, stacktrace)

    const that = args[0]

    assert(that.constructor === ArrayType, 'Type', `Wrong type. Expected an array, but found ${that.name}`, stacktrace)

    let elems = that.elements
    let types = this.elements
    assert(types.length >= elems.length, 'Type', `${elems.length - types.length} too many value(s)`, stacktrace)

    for (let t = 0; t < types.length; t++) {
      const type = types[t]
      type.check([elems[t]], [...stacktrace, `element ${t + 1}`])
    }
  }
}
