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

    for (let t = 0; t < types.length; t++) {
      const type = types[t]
      elems = type.check(elems, [...stacktrace, `element ${t + 1}`])
    }

    assert(elems.length === 0, 'Type', `${elems.length} too many value(s)`, stacktrace)

    return args.slice(1)
  }
}
