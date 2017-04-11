const assert = require('../helpers').assert

exports.ArrayType = class {
  constructor (...elements) {
    this.elements = elements
    this.name = 'array'
  }

  toString () {
    return this.elements.reduce((acc, val, i) => {
      return acc + (i > 0 ? ', ' : '') + val
    }, '[') + ']'
  }

  check (args) {
    const that = args[0]

    assert(args.length > 0, 'Type', `Expected at least one more argument to match ${this}`)
      .and(that.constructor === this.constructor, 'Type', `Wrong type. Expected an array, but found ${that.name}`)

    let elems = that.elements,
      types = this.elements

    for (let type of types) {
      elems = type.check(elems)
    }

    if (elems.length)

    return args.slice(1)
  }
}
