const assert = require('../helpers').assert

exports.ObjectType = class {
  constructor (model) {
    this.model = model
    this.name = 'object'
  }

  toString () {
    return this.type.name
  }

  check (args) {
    const that = args[0]

    const thisLength = Object.keys(this.model).length,
      thatLength = Object.keys(that.model).length

    assert(args.length > 0, 'Type', `Expected at least one more argument to match ${this}`)
      .and(that.constructor === this.constructor, 'Type',`Wrong type. Expected an object, but found ${that.name}`)
      .and(thisLength === thatLength, 'Type', `Expected ${thisLength} properties, but found ${thatLength}`)

    for (var prop in this.model) {
      if (this.model.hasOwnProperty(prop)) {
        assert(that.model.hasOwnProperty(prop), 'Type', `Expected property ${prop} to be defined`)

        this.model[prop].check([that])
      }
    }

    return args.slice(1)
  }
}
