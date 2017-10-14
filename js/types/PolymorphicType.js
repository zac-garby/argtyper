const assert = require('../errors').assert

exports.PolymorphicType = class PolymorphicType {
  constructor (...types) {
    this.types = types
    this.name = 'any'
  }

  toString () {
    return this.types.reduce((acc, val, i) => {
      return acc + (i > 0 ? ' | ' : '') + val
    }, '<') + '>'
  }

  check (arg, stacktrace) {
    assert(!!arg, 'Type', `Expected at least one more argument to match ${this}`, stacktrace)

    const match = this.types.some((type) => {
      try {
        type.check(arg)
        return true
      } catch (e) {
        return false
      }
    })

    assert(match, 'Type', `Wrong type. Expected ${this} but found ${arg}`, stacktrace)
  }
}
