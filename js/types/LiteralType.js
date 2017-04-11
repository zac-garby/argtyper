const assert = require('../errors').assert

exports.LiteralType = class LiteralType {
  constructor (type) {
    this.type = type
    this.name = 'literal'
  }

  toString () {
    return this.type.name
  }

  check (args) {
    const that = args[0]

    assert(args.length > 0, 'Type', `Expected at least one more argument to match ${this}`)
      .and(that.constructor === LiteralType, 'Type',`Wrong type. Expected a basic type, but found ${that.name}`)
      .and(that.type === this.type, 'Type', `Wrong type. Expected ${this} but found ${that}`)

    return args.slice(1)
  }
}
