const assert = require('../errors').assert

exports.ObjectType = class ObjectType {
  constructor (model) {
    this.model = model
    this.name = 'object'
  }

  toString () {
    return JSON.stringify(this.model)
  }

  check (arg, stacktrace) {
    assert(!!arg, 'Type', `Expected at least one more value to match ${this}`, stacktrace)

    assert(arg.constructor === ObjectType, 'Type', `Wrong type. Expected an object, but found ${arg.name}`, stacktrace)

    const thisLength = Object.keys(this.model).length
    const argLength = Object.keys(arg.model).length

    assert(thisLength === argLength, 'Type', `Expected ${thisLength} properties, but found ${argLength}`, stacktrace)

    for (var prop in this.model) {
      if (this.model.hasOwnProperty(prop)) {
        assert(arg.model.hasOwnProperty(prop), 'Type', `Expected property ${prop} to be defined`,
          [...stacktrace, `property ${prop}`])

        this.model[prop].check(arg.model[prop], stacktrace)
      }
    }
  }
}
