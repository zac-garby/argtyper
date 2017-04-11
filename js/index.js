#!/usr/bin/env node

'use strict'

const esprima = require('esprima')
const mapValues = require('object.map')

const assert = require('./errors').assert

const wrapValue = require('./helpers').wrapValue
const getType = require('./helpers').getType

const aliases = []

function checkArguments (types, args) {
  args = args.map(wrapValue)

  for (let type of types) {
    args = type.check(args)
  }

  assert(args.length === 0, 'Type', `${args.length} too many arguments!`)
}

exports.type = function (fn) {
  const exp = esprima.parse(`(${fn.toString()})`).body[0].expression,
    argsAST = exp.params

  const types = argsAST.map((arg) => {
    assert(arg.type === 'AssignmentPattern', 'Parse', 'Expected a default value to be used as the type for all arguments.')

    return getType(arg.right)
  })

  return function (...args) {
    checkArguments(types, args)

    return fn(...args)
  }
}

exports.typeAll = function (object) {
  for (var prop in object) {
    if (object.hasOwnProperty(prop) && typeof object[prop] === 'function') {
      object[prop] = exports.type(object[prop]);
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
    type: getType(exp.body)
  }

  aliases.push(alias)
}

exports.type(function (a=Repeat(Number)) {
  console.log(a)
})([1, 2, 3, 4, 5])
