'use strict'

const esprima = require('esprima')
const mapValues = require('object.map')

const aliases = []

class Any {
  constructor (types) {
    this.types = types
  }

  toString () {
    return this.types.reduce((acc, val, index) => {
      return acc + (index === 0 ? '' : ' | ') + typeToString(val)
    }, '<') + '>'
  }

  isValid (arg) {
    for (let type of this.types) {
      try {
        checkArgument(type, arg, [], true)
        return true
      } catch (e) {}
    }

    return false
  }
}

function err(type, text, stacktrace=null) {
  if (stacktrace) {
    let str = `(${type}) ${text}`
    for (const item of stacktrace.reverse()) {
      str += `\n    of ${item}`
    }

    throw new Error(str + '\n    ---')
  }
  throw new Error(`(${type}) ${text}`)
}

function typeToString (type) {
  if (type.constructor === Array) {
    return type.reduce((acc, val, index) => {
      return acc + (index === 0 ? '' : ', ') + typeToString(val)
    }, '[') + ']'
  } else if (type.constructor === Object) {
    type = mapValues(type, (val) => {
      return typeToString(val)
    })

    return JSON.stringify(type)
  } else if (type.constructor === Function) {
    return type.name
  } else if (type.constructor === Any) {
    return type.toString()
  } else {
    return typeToString(type.constructor)
  }
}

// Takes part of an AST and returns an actual JavaScript value representing it
function getType (expr) {
  const type = expr.type

  if (type === 'Identifier') {
    const name = expr.name

    if (name === 'Any') {
      return null
    }

    for (let alias of aliases) {
      if (alias.name === name) {
        return expandAlias(alias)
      }
    }

    return eval(name)
  } else if (type === 'ArrayExpression') {
    return expr.elements.map((elem) => {
      return getType(elem)
    })
  } else if (type === 'ObjectExpression') {
    const obj = {}
    for (let elem of expr.properties) {
      obj[elem.key.name] = getType(elem.value)
    }
    return obj
  } else if (type === 'CallExpression') {
    if (expr.callee.name === 'Any') {
      const types = expr.arguments.map(getType)
      return new Any(types)
    } else {
      err('Type', `Invalid function call in type`)
    }
  } else {
    err('Type', `Invalid constraint '${typeToString(type)}'. Expected a Function, Array, or Object`)
  }
}

function expandAlias (type) {
  const obj = {}

  for (var prop in type.type) {
    if (type.type.hasOwnProperty(prop)) {
      obj[prop] = type.type[prop]
    }
  }

  return obj
}

function checkArguments (types, args) {
  if (args.length !== types.length) {
    err('Argument', `Wrong number of arguments! Expected ${types.length}, and found ${args.length}`)
  }

  for (let i = 0; i < args.length; i++) {
    let stacktrace = [`argument ${i + 1}`]
    checkArgument(types[i], args[i], stacktrace)
  }
}

function checkArgument (type, arg, stacktrace) {
  if (!type) return

  const argType = arg.constructor

  function typeError() {
    err('Type', `Invalid type ${typeToString(arg)}. Expected ${typeToString(type)}`, stacktrace)
  }

  if (type.constructor === Any) {
    if (!type.isValid(arg)) {
      typeError()
    }
  } else if (argType === Array) {
    if (type.constructor !== Array) {
      typeError()
    }

    arg.map((elem, i) => {
      checkArgument(type[i], elem, [...stacktrace, `element ${i + 1}`])
      return elem
    })
  } else if (argType === Object) {
    if (type.constructor !== Object) {
      typeError()
    }

    mapValues(arg, (value, key) => {
      checkArgument(type[key], value, [...stacktrace, `item ${key}`])
    })
  } else if (argType !== type) {
    typeError()
  }
}

exports.type = function (fn) {
  const argsAST = esprima.parse(`(${fn.toString()})`).body[0].expression.params

  const types = argsAST.map((arg) => {
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

  if (exp.body.type !== 'Identifier') {
    throw new Error('Expecting an identifier for the alias')
  }

  const alias = {
    name: exp.body.name,
    type: {}
  }

  for (let arg of exp.params) {
    if (arg.type !== 'AssignmentPattern') {
      throw new Error('Expecting an assignment for each argument. e.g. "x=Number" instead of just "x"')
    }
    alias.type[arg.left.name] = getType(arg.right)
  }

  aliases.push(alias)
}

exports.getDefinedAliases = () => { return aliases }
