var chai = require('chai');
var expect = chai.expect;

var type = require('../index');

var window = {
  'Number': Number,
  'String': String,
  'Boolean': Boolean
};

// Define a test function
function add(a=[Number], b=[Number]) {
  return a + b;
}

var arrowAdd = (a=[Number], b=[Number]) => {
  return a + b;
}

add = type(add);
arrowAdd = type(arrowAdd);

describe('argtyper', function() {
  it('should allow correctly typed arguments', () => {
    expect(function() {
      add(5, 5);
    }).to.not.throw(Error).and.to.equal(10);
  });
  it('should work correctly with arrow functions', () => {
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
});
