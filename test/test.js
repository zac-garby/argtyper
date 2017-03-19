var chai = require('chai');
var expect = chai.expect;

var type = require('../index').type;
var typeAll = require('../index').typeAll;
var typeClass = require('../index').typeClass;

// Define a test function
function add(a=[Number], b=[Number]) {
  return a + b;
}

add = type(add);

describe('argtyper', function() {
  describe('type()', function() {
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

    it('should allow multiple types', () => {
      function addMultiple(a=[String, Number], b=[String, Number]) {
        return a + b;
      }

      expect(function() {
        addMultiple(5, 'a');
      }).to.not.throw(Error).and.to.equal('5a');
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
    });

    it('should automatically convert to string if needed', () => {
      function concatenate(a=String, b=String) {
        expect(a).to.be.a('string');
        expect(b).to.be.a('string');

        return a + b;
      }

      concatenate = type(concatenate);

      expect(function() {
        concatenate(5, 3);
      }).to.not.throw(Error).and.to.equal('53');
    });
  });

  describe('typeAll()', function() {
    it('should work when an object only contains functions', () => {
      let obj = {
        add: function(x=Number, y=Number) {
          return x + y;
        },
        mul: function(x=Number, y=Number) {
          return x * y;
        }
      };

      expect(function() {
        typeAll(obj);
      }).to.not.throw(Error);

      expect(obj.add(3, 5)).to.equal(8);
      expect(obj.mul(2, 10)).to.equal(20);

      expect(function() {
        obj.add('a', 1)
      }).to.throw(Error);
    });

    it('should work on a mix of functions and other values', () => {
      let obj = {
        add: function(x=Number, y=Number) {
          return x + y;
        },
        j: 10,
        k: {}
      };

      expect(function() {
        typeAll(obj);
      }).to.not.throw(Error);

      expect(obj.add(3, 5)).to.equal(8);

      expect(function() {
        obj.add('a', 1)
      }).to.throw(Error);
    });
  });
});
