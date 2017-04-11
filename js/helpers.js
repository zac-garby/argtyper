/* eslint-disable no-eval */

const LiteralType = require('./types/LiteralType').LiteralType
const ArrayType = require('./types/ArrayType').ArrayType
const ObjectType = require('./types/ObjectType').ObjectType
const AnyType = require('./types/AnyType').AnyType
const PolymorphicType = require('./types/PolymorphicType').PolymorphicType
const RepeatedType = require('./types/RepeatedType').RepeatedType

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

/*
 * Takes an AST and returns a JS value representing it
 */
exports.getType = function (AST, aliases) {
  const type = AST.type // e.g. 'Identifier', 'ArrayExpression', etc...

  switch (type) {
    case 'Identifier':
      for (let alias of aliases) {
        if (alias.name === AST.name) {
          return exports.getType(alias.AST, aliases)
        }
      }

      if (AST.name === 'Any') {
        return new AnyType()
      }

      return exports.wrapType(eval(AST.name))
    case 'ArrayExpression':
      let arr = AST.elements.map((elem) => exports.getType(elem, aliases))

      return new ArrayType(...arr)
    case 'ObjectExpression':
      let obj = {}

      for (let prop of AST.properties) {
        assert(prop.key.type === 'Identifier', 'Parse', 'Expected an identifier for every key')

        obj[prop.key.name] = exports.getType(prop.value, aliases)
      }
      return new ObjectType(obj)
    case 'CallExpression':
      assert(AST.callee.type === 'Identifier', 'Parse', 'Expected an identifier for the callee\'s name')
      if (AST.callee.name === 'Any') {
        assert(AST.arguments.length > 0, 'Parse', 'Expected at least one constraint for \'Any\'')
        return new PolymorphicType(...AST.arguments.map((type) => exports.getType(type, aliases)))
      } else if (AST.callee.name === 'Repeat') {
        assert(AST.arguments.length > 0 && AST.arguments.length < 3, 'Parse', 'Expected one or two arguments to \'Repeat\'')

        const constraint = exports.getType(AST.arguments[0], aliases)

        if (AST.arguments.length === 2) {
          const amountArg = AST.arguments[1]
          assert(amountArg.type === 'Literal', 'Parse', 'Expected a literal as the second argument to \'Repeat\'')
            .and(parseInt(amountArg.value) === amountArg.value, 'Parse', 'Expected an integer as the second argument to \'Repeat\'')

          const amount = parseInt(amountArg.value)
          const arr = []

          for (let i = 0; i < amount; i++) {
            arr.push(constraint)
          }

          return new ArrayType(...arr)
        } else {
          return new RepeatedType(constraint)
        }
      } else {
        throw new Error(`Invalid constraint function call, ${AST.callee.name}`)
      }
    default:
      throw new Error(`Invalid constraint type, ${type}!`)
  }
}

/* eslint-enable no-eval */
