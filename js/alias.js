'use strict';

const esprima = require('esprima')

const assert = require('./errors').assert
const getType = require('./helpers').getType

exports.aliases = []

exports.typedef = function (fn) {
  const exp = esprima.parse(`(${fn.toString()})`).body[0].expression

  assert(exp.type === 'ArrowFunctionExpression', 'Parse', 'Expected an arrow function as the only argument to typedef')
    .and(exp.params.length === 1, 'Parse', 'Expected only one argument to the arrow function')
    .and(exp.params[0].type === 'Identifier', 'Parse', 'Expected an identifier as the alias name')

  assert(!exports.aliases.some((elem) => {
    elem.name === exp.params[0].name
  }))

  const alias = {
    name: exp.params[0].name,
    type: getType(exp.body)
  }

  exports.aliases.push(alias)
}
