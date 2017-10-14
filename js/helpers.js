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
    var obj = {}

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
    var obj = {}

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
      for (var alias of aliases) {
        if (alias.name === AST.name) {
          return exports.getType(alias.AST, aliases)
        }
      }

      if (AST.name === 'Any') {
        return new AnyType()
      }

      return exports.wrapType(eval(AST.name))
    case 'ArrayExpression':
      const elems = AST.elements
      if (elems.length === 1) {
        // Special case. [Constraint * n] or [...Constraint]
        if (elems[0].type === 'BinaryExpression') {
          const left = elems[0].left
          const right = elems[0].right

          assert(right.type === 'Literal' && parseInt(right.value) === right.value,
            'Parse', 'Expected an integer literal as the constraint amount')

          const constraint = exports.getType(left, aliases)
          const amount = right.value
          const arr = []

          for (var i = 0; i < amount; i++) {
            arr.push(constraint)
          }

          return new ArrayType(...arr)
        } else if (elems[0].type === 'SpreadElement') {
          const constraint = exports.getType(elems[0].argument, aliases)
          return new RepeatedType(constraint)
        }
      }

      let arr = elems.map((elem) => exports.getType(elem, aliases))

      return new ArrayType(...arr)
    case 'ObjectExpression':
      let obj = {}

      for (let prop of AST.properties) {
        assert(prop.key.type === 'Identifier', 'Parse', 'Expected an identifier for every key')

        obj[prop.key.name] = exports.getType(prop.value, aliases)
      }
      return new ObjectType(obj)
    case 'BinaryExpression':
      const operator = AST.operator

      if (operator === '|') {
        const left = exports.getType(AST.left, aliases)
        const right = exports.getType(AST.right, aliases)

        if (left.constructor === PolymorphicType) {
          return new PolymorphicType(...left.types, right)
        } else if (right.constructor === PolymorphicType) {
          return new PolymorphicType(left, ...right.types)
        } else if (left.constructor === PolymorphicType && right.constructor === PolymorphicType) {
          return new PolymorphicType(...left.types, ...right.types)
        }

        return new PolymorphicType(left, right)
      } else {
        assert(false, 'Parse', `Unexpected operator ${operator} in a constraint`)
        break
      }
    default:
      throw new Error(`Invalid constraint type, ${type}!`)
  }
}

/* eslint-enable no-eval */
