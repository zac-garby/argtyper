const assert = require('../errors').assert

exports.LiteralType = class LiteralType {
  constructor (type) {
    this.type = type
    this.name = 'literal'
  }

  toString () {
    return this.type.name
  }

  check (arg, stacktrace) {
    assert(!!arg, 'Type', `Expected at least one more value to match ${this}`, stacktrace)

    assert(arg.constructor === LiteralType, 'Type', `Wrong type. Expected a basic type, but found ${arg.name}`, stacktrace)
      .and(arg.type === this.type, 'Type', `Wrong type. Expected ${this} but found ${arg}`, stacktrace)
  }
}
