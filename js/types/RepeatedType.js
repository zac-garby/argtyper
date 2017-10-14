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

  check (arg, stacktrace) {
    assert(!!arg, 'Type', `Expected at least one more value to match ${this}`, stacktrace)

    assert(arg.constructor === ArrayType, 'Type', `Wrong type. Expected an array, but found ${arg.name}`, stacktrace)
      .and(arg.elements.length > 0, 'Type', 'Expected at least one element in the array', stacktrace)

    for (let i = 0; i < arg.elements.length; i++) {
      let elem = arg.elements[i]
      try {
        this.type.check(elem)
      } catch (e) {
        return assert(false, 'Type', `Wrong type. Expected ${this.type}, but found ${elem}`,
          [...stacktrace, `element ${i + 1}`])
      }
    }
  }
}
