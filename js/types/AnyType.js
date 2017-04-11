exports.AnyType = class AnyType {
  constructor () {
    this.name = 'any'
  }

  toString () {
    return 'Any'
  }

  check (args, stacktrace) {
    return args.slice(1)
  }
}
