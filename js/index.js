#!/usr/bin/env node

'use strict'

const esprima = require('esprima')

const assert = require('./errors').assert

const wrapValue = require('./helpers').wrapValue
const getType = require('./helpers').getType

const aliases = []

function checkArguments (types, args) {
  args = args.map(wrapValue)

  for (let t = 0; t < types.length; t++) {
    const type = types[t]
    args = type.check(args, [`argument ${t + 1}`])
  }

  assert(args.length === 0, 'Type', `${args.length} too many arguments!`)
}

exports.type = function (fn) {
  const exp = esprima.parse(`(${fn.toString()})`).body[0].expression
  let returnType = null

  if (exp.body.type === 'ArrowFunctionExpression' &&
      exp.body.params.length === 1) {
    let params = exp.body.params

    if (params[0].type === 'AssignmentPattern') {
      assert(params[0].left.name === '_', 'Parse', `Unexpected param name: '${params[0].left.name}'. Expected '_'`)
      returnType = getType(params[0].right, aliases)
    } else {
      returnType = getType(params[0], aliases)
    }
  }

  const argsAST = exp.params

  const types = argsAST.map((arg) => {
    assert(arg.type === 'AssignmentPattern', 'Parse', 'Expected a default value to be used as the type for all arguments.')

    return getType(arg.right, aliases)
  })

  return function (...args) {
    checkArguments(types, args)

    let result = fn(...args)

    if (returnType) {
      let applied = result()
      returnType.check([wrapValue(applied)], [])

      return applied
    }

    return result
  }
}

exports.typeAll = function (object) {
  for (var prop in object) {
    if (object.hasOwnProperty(prop) && typeof object[prop] === 'function') {
      object[prop] = exports.type(object[prop])
    }
  }
}

exports.typedef = function (fn) {
  const exp = esprima.parse(`(${fn.toString()})`).body[0].expression

  assert(exp.type === 'ArrowFunctionExpression', 'Parse', 'Expected an arrow function as the only argument to typedef')
    .and(exp.params.length === 1, 'Parse', 'Expected only one argument to the arrow function')
    .and(exp.params[0].type === 'Identifier', 'Parse', 'Expected an identifier as the alias name')

  const alias = {
    name: exp.params[0].name,
    AST: exp.body
  }

  aliases.push(alias)
}
