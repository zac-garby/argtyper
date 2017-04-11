const ArrayType = require('./ArrayType').ArrayType

const assert = require('../errors').assert

exports.RepeatedType = class RepeatedType {
  constructor (type) {
    this.type = type
    this.name = 'repeated'
  }

  toString () {
    return `[...${this.type}]`
  }

  check (args, stacktrace) {
    assert(args.length > 0, 'Type', `Expected at least one more value to match ${this}`, stacktrace)

    const that = args[0]

    assert(that.constructor === ArrayType, 'Type', `Wrong type. Expected an array, but found ${that.name}`, stacktrace)
      .and(that.elements.length > 0, 'Type', 'Expected at least one element in the array', stacktrace)

    for (let i = 0; i < that.elements.length; i++) {
      let elem = that.elements[i]
      try {
        this.type.check([elem])
      } catch (e) {
        return assert(false, 'Type', `Wrong type. Expected ${this.type}, but found ${elem}`,
          [...stacktrace, `element ${i + 1}`])
      }
    }

    return args.slice(1)
  }
}
