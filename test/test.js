var chai = require('chai')
var expect = chai.expect

var argtyper = require('../index')

var type = argtyper.type,
  typeAll = argtyper.typeAll,
  typedef = argtyper.typedef

// Define a test function
function add(a=Number, b=Number) {
  return a + b
}

add = type(add)

describe('argtyper', function() {
  it('should allow correctly typed arguments', () => {
    expect(() => {
      add(5, 5)
    }).to.not.throw(Error).and.to.equal(10)

    expect(() => {
      add(5, true)
    }).to.throw(Error)
  })

  it('should disallow too few arguments', () => {
    expect(() => {
      add(5)
    }).to.throw(Error)
  })

  it('should disallow too many arguments', () => {
    expect(() => {
      add(1, 2, 3)
    }).to.throw(Error)
  })

  it('should work with the \'Any\' class to allow polymorphic constraints', () => {
    const fn = type(function(a=Any(Number, String)) {})

    expect(() => {
      fn(5)
    }).to.not.throw(Error)

    expect(() => {
      fn('hello')
    }).to.not.throw(Error)

    expect(() => {
      fn(true)
    }).to.throw(Error)
  })

  it('should work with the \'Any\' class to allow untyped arguments', () => {
    const fn = type(function(a=Any, b=String) {})

    expect(() => {
      fn(true, 'hello')
    }).to.not.throw(Error)

    expect(() => {
      fn(5, 'hello')
    }).to.not.throw(Error)

    expect(() => {
      fn(() => {}, 'hello')
    }).to.not.throw(Error)
  })

  it('should work with n-dimensional arrays', () => {
    const fn = type(function(a=[Number, [Number, [Number, [Number]]]]) {})

    expect(() => {
      fn([1, [2, [3, [4]]]])
    }).to.not.throw(Error)

    expect(() => {
      fn([1, [2, [3, [true]]]])
    }).to.throw(Error)
  })

  it('should work with n-dimensional objects', () => {
    const fn = type(function(a={x: {y: {z: Number}}}) {})

    expect(() => {
      fn({x: {y: {z: 5}}})
    }).to.not.throw(Error)

    expect(() => {
      fn({x: {y: {z: true}}})
    }).to.throw(Error)
  })

  it('should work with object aliases', () => {
    typedef(Vector => ({x: Number, y: Number}))

    const mul = type((a=Vector, b=Number) => {
      return { x: a.x * b, y: a.y * b }
    })

    expect(() => {
      return mul({x: 5, y: 3}, 2)
    }).to.not.throw(Error).and.to.equal({ x: 10, y: 6 })

    expect(() => {
      mul({x: 3, y: ';-)'}, 3)
    }).to.throw(Error)
  })

  it('should work with array aliases', () => {
    typedef(SetOfThree => [Number, Number, Number])

    const sumOfThree = type((x=SetOfThree) => {
      return x[0] + x[1] + x[2]
    })

    expect(() => {
      return sumOfThree([3, 2, 1])
    }).to.not.throw(Error).and.to.equal(6)

    expect(() => {
      sumOfThree([3, 2, 'one'])
    }).to.throw(Error)
  })

  it('should work with single-type aliases', () => {
    typedef(Num => Number)

    const add = type((a=Num, b=Num) => {
      return a + b
    })

    expect(() => {
      return add(5, 3)
    }).to.not.throw(Error).and.to.equal(8)

    expect(() => {
      return add(5, 'three')
    }).to.throw(Error)
  })

  it('typeAll should work on an object only containing functions', () => {
    const obj = {
      add: function(x=Number, y=Number) {
        return x + y
      },
      mul: function(x=Number, y=Number) {
        return x * y
      }
    }

    expect(function() {
      typeAll(obj)
    }).to.not.throw(Error)

    expect(obj.add(3, 5)).to.equal(8)
    expect(obj.mul(2, 10)).to.equal(20)

    expect(function() {
      obj.add('a', 1)
    }).to.throw(Error)
  })

  it('typeAll should work on a mix of functions and other values', () => {
    const obj = {
      add: function(x=Number, y=Number) {
        return x + y
      },
      j: 10,
      k: {}
    }

    expect(function() {
      typeAll(obj)
    }).to.not.throw(Error)

    expect(obj.add(3, 5)).to.equal(8)

    expect(function() {
      obj.add('a', 1)
    }).to.throw(Error)
  })
})
