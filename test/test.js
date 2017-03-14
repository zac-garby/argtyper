var chai = require('chai');
var expect = chai.expect;

var type = require('../index');

// Define a test function
function add(a=[Number], b=[Number]) {
  return a + b;
}

add = type(add);

describe('argtyper', function() {
  it('should allow correctly typed arguments', () => {
    expect(function() {
      add(5, 5);
    }).to.not.throw(Error).and.to.equal(10);
  });

  it('should work correctly with arrow functions', () => {
    var arrowAdd = (a=[Number], b=[Number]) => {
      return a + b;
    }

    arrowAdd = type(arrowAdd);

    expect(function() {
      arrowAdd(5, 5);
    }).to.not.throw(Error).and.to.equal(10);
  });

  it('should disallow arguments of the wrong type', () => {
    expect(function() {
      add(5, 'a');
    }).to.throw(Error);
  });

  it('should disallow too few arguments', () => {
    expect(function() {
      add(5);
    }).to.throw(Error);
  });

  it('should disallow too many arguments', () => {
    expect(function() {
      add(5, 7, 10);
    }).to.throw(Error);
  });

  it('should allow non-array types', () => {
    function nonArrayAdd(a=Number, b=Number) {
      return a + b;
    }

    nonArrayAdd = type(nonArrayAdd);

    expect(function() {
      nonArrayAdd(5, 5);
    }).to.not.throw(Error).and.to.equal(10);
  });

  it('should allow non-typed arguments', () => {
    function nonTypedAdd(a, b) {
      return a + b;
    }

    nonTypedAdd = type(nonTypedAdd);

    expect(function() {
      nonTypedAdd(5, 5);
    }).to.not.throw(Error).and.to.equal(10);

    expect(function() {
      nonTypedAdd('Hello: ', 5);
    }).to.not.throw(Error).and.to.equal('Hello: 5');
  });

  it('should allow a mix of typed and non-typed arguments', () => {
    function mixedAdd(a, b=Number) {
      return a + b;
    }

    mixedAdd = type(mixedAdd);

    expect(function() {
      mixedAdd('a', 5);
    }).to.not.throw(Error).and.to.equal('a5');

    expect(function() {
      mixedAdd(3, 5);
    }).to.not.throw(Error).and.to.equal(8);
  })
});
