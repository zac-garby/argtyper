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

  check (args) {
    const that = args[0]

    assert(args.length > 0, 'Type', `Expected at least one more value to match ${this}`)
      .and(that.constructor === ArrayType, 'Type', `Wrong type. Expected an array, but found ${that.name}`)
      .and(that.elements.length > 0, 'Type', 'Expected at least one element in the array')

    for (let elem of that.elements) {
      try {
        this.type.check([elem])
      } catch (e) {
        return assert(false, 'Type', 'Wrong type')
      }
    }

    return args.slice(1)
  }
}
