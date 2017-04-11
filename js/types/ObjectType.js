const assert = require('../errors').assert

exports.ObjectType = class ObjectType {
  constructor (model) {
    this.model = model
    this.name = 'object'
  }

  toString () {
    return JSON.stringify(this.model)
  }

  check (args, stacktrace) {
    assert(args.length > 0, 'Type', `Expected at least one more value to match ${this}`, stacktrace)

    const that = args[0]

    assert(that.constructor === ObjectType, 'Type',`Wrong type. Expected an object, but found ${that.name}`, stacktrace)

    const thisLength = Object.keys(this.model).length,
        thatLength = Object.keys(that.model).length

    assert(thisLength === thatLength, 'Type', `Expected ${thisLength} properties, but found ${thatLength}`, stacktrace)

    for (var prop in this.model) {
      if (this.model.hasOwnProperty(prop)) {
        assert(that.model.hasOwnProperty(prop), 'Type', `Expected property ${prop} to be defined`,
          [...stacktrace, `property ${prop}`])

        this.model[prop].check([that.model[prop]], stacktrace)
      }
    }

    return args.slice(1)
  }
}
