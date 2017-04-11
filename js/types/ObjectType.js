const assert = require('../errors').assert

exports.ObjectType = class ObjectType {
  constructor (model) {
    this.model = model
    this.name = 'object'
  }

  toString () {
    return JSON.stringify(this.model)
  }

  check (args) {
    const that = args[0]

    assert(args.length > 0, 'Type', `Expected at least one more value to match ${this}`)
      .and(that.constructor === ObjectType, 'Type',`Wrong type. Expected an object, but found ${that.name}`)

    const thisLength = Object.keys(this.model).length,
        thatLength = Object.keys(that.model).length

    assert(thisLength === thatLength, 'Type', `Expected ${thisLength} properties, but found ${thatLength}`)

    for (var prop in this.model) {
      if (this.model.hasOwnProperty(prop)) {
        assert(that.model.hasOwnProperty(prop), 'Type', `Expected property ${prop} to be defined`)

        this.model[prop].check([that.model[prop]])
      }
    }

    return args.slice(1)
  }
}
