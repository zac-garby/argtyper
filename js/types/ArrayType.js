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

  check (arg, stacktrace) {
    assert(!!arg, 'Type', `Expected at least one more value to match ${this}`, stacktrace)

    assert(arg.constructor === ArrayType, 'Type', `Wrong type. Expected an array, but found ${arg.name}`, stacktrace)

    let elems = arg.elements
    let types = this.elements
    assert(types.length >= elems.length, 'Type', `${elems.length - types.length} too many value(s)`, stacktrace)

    for (let t = 0; t < types.length; t++) {
      types[t].check(elems[t], [...stacktrace, `element ${t + 1}`])
    }
  }
}
