const LiteralType = require('./types/LiteralType').LiteralType,
  ArrayType = require('./types/ArrayType').ArrayType,
  ObjectType = require('./types/ObjectType').ObjectType

const assert = require('./errors').assert

/*
 * Number -> LiteralType(Number)
 * [Number, [String, Number]] -> ArrayType(LiteralType(Number), ArrayType ...)
 * ^^ so it's recursive
 */
exports.wrapType = function (constructor) {
  if (constructor.constructor === Array) {
    return new ArrayType(...constructor.map(exports.wrapType))
  } else if (constructor.constructor === Object) {
    let obj = {}

    for (var prop in constructor) {
      if (constructor.hasOwnProperty(prop)) {
        obj[prop] = exports.wrapType(constructor[prop])
      }
    }

    return new ObjectType(obj)
  } else {
    return new LiteralType(constructor)
  }
}

/*
 * 5 -> LiteralType(Number)
 * [1, [2, 3]] -> ArrayType(LiteralType(Number), ArrayType(LiteralType(Number), LiteralType(Number)))
 * ^^ so it's recursive
 */
exports.wrapValue = function (val) {
  const constructor = val.constructor

  if (constructor === Array) {
    return new ArrayType(...val.map(exports.wrapValue))
  } else if (constructor === Object) {
    let obj = {}

    for (var prop in val) {
      if (val.hasOwnProperty(prop)) {
        obj[prop] = exports.wrapValue(val[prop])
      }
    }

    return new ObjectType(obj)
  } else {
    return new LiteralType(constructor)
  }
}

exports.getType = function (AST) {
  const type = AST.type // e.g. 'Identifier', 'ArrayExpression', etc...

  switch (type) {
    case 'Identifier':
      if (AST.name === 'Any') {
        return null
      }
      
      return exports.wrapType(eval(AST.name))
    case 'ArrayExpression':
      let arr = AST.elements.map((elem) => exports.getType(elem))

      return new ArrayType(...arr)
    case 'ObjectExpression':
      let obj = {}

      for (let prop of AST.properties) {
        assert(prop.key.type === 'Identifier', 'Parse', 'Expected an identifier for every key')

        obj[prop.key.name] = exports.getType(prop.value)
      }
      return new ObjectType(obj)
    default:
      throw new Error(`Invalid constraint type, ${type}!`)
  }
}
