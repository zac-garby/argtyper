const assert = require('../errors').assert

exports.LiteralType = class LiteralType {
  constructor (type) {
    this.type = type
    this.name = 'literal'
  }

  toString () {
    return this.type.name
  }

  check (args, stacktrace) {
    assert(args.length > 0, 'Type', `Expected at least one more value to match ${this}`, stacktrace)

    const that = args[0]

    assert(that.constructor === LiteralType, 'Type', `Wrong type. Expected a basic type, but found ${that.name}`, stacktrace)
      .and(that.type === this.type, 'Type', `Wrong type. Expected ${this} but found ${that}`, stacktrace)

    return args.slice(1)
  }
}
