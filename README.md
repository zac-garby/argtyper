# argtyper

### JS Type-Constraints without compilation.

Type checking is very useful in JavaScript - it helps catch a number of different bugs.
However, to actually use type checking normally, you'd install a library such as Flow,
which is great, but you have to compile your program. This not only takes time, but is
annoying to set up.

_argtyper_, is a better way to implement type checking for function arguments.
Because of the way it works, it's only _possible_ at the moment to do it for arguments -
sadly not variable declarations. But, that's not a huge problem because most of the bugs
actually come from wrongly typed arguments.

## Installation

If you're using npm, you can just run this command to install [_argtyper_](https://www.npmjs.com/package/argtyper):

```
$ npm install --save argtyper
```

And to import the _type_ function into a file, use the following:

```javascript
var type = require('argtyper').type
```

You can then just call _type_ on functions, as documented in the example below.

## Example

Here is a basic program using _argtyper_. In it, a simple function, called `add`,
is defined, with two arguments, called _a_ and _b_. Both of them are _Number_'s
: the allowed type is written following an equals, after the
name of the argument.

```javascript
function add(a=Number, b=Number) {
  return a + b
}

add = type(add)
```

The last line is very important. The _type_ function wraps a given function in some type
checking code and returns the new one.

Below are some test cases, showing what happens when `add` is executed with different
arguments.

```javascript
// Test cases

add(5, 3)                //=> 8
add(5, true)             //=> Error
add(6, 1, 8)             //=> Error
add(7)                   //=> Error
```

It also works with arrow functions, which can be useful to make typed functions
a little faster to write. The function above can be rewritten as the following:

```javascript
var add = type((a=Number, b=Number) => {
  return a + b;
});
```

### Typing objects

_argtyper_ also has a function to type all functions in an object, called
`typeAll()`. It takes one argument: _object_, which is the object to type.

To import it, use the following:

```javascript
var typeAll = require('argtyper').typeAll
```

And here's how to use it:

```javascript
const maths = {
  add = function (a=Number, b=Number) {
    return a + b;
  },
  mul = function (a=Number, b=Number) {
    return a * b
  }
};

typeAll(maths) // Note you don't have to assign it back to the object

maths.add(5, 5)    //=> 10
maths.mul(5, 5)    //=> 25
maths.add('2', 10) //=> Error
```

As kind of demonstrated in that example, the `typeAll` function can be very
useful if you want to type a _module_, if that module is defined as properties
of an object.

## Documentation

### Types of constraints

There are many different types of constraints in _argtyper_. Here's a list!

 - `ClassName` - The simplest constraint, which you've already seen in the earlier
   examples, is just a single class name, such as _Number_ or _String_.
    - Don't use _Array_ or _Object_ as a class name, as they are to be written
      using their own syntax (described below.)
    - Also don't use _Any_, because it's it's own separate thing.
    - Example: `Number` allows a number

 - `[Constraint, Constraint ...]` - When having an array as an argument to a function, you specify
   the types for each element of that array. The syntax is very similar to
   defining a normal array, except each element of the constraining array should
   be another constraint (i.e. a class name, another array, etc...)
    - Example: `[Number, String, [Number, Number, Number]]` allows an array
      where the first element is a number, the second a string, and the third
      another array containing three numbers.

 - `{x: Constraint, y: Constraint ...}` - You can add an object constraint in a
   similar fashion to an array. Again, you use the exact same syntax as writing
   an object, just each property's value should be another constraint.
    - Example: `{x: Number, y: Number}` allows a two-dimensional vector in the
      form of an object with an x and y field, both numbers.

 - `Any(Constraint, Constraint ...)` - It's also possible for an argument to
   accept multiple types, using the _Any()_ syntax. It's fairly simple - here's
   an example:
    - Example: `Any(Number, String)` allows either a number or a string

 - `Any` - The word _Any_ on its own just allows anything through. It's how
   you can make an untyped argument in _argtyper_.

### Aliases

Say you're writing a game. You'd probably use a lot of Vectors. In _argtyper_, you might represent a vector similar to the following:

```javascript
function addThreeVectors (
	a={x: Number, y: Number},
	b={x: Number, y: Number},
	c={x: Number, y: Number}
) {
	...
}
```

But as you can see, it just takes too long to write. And imagine if you repeatedly used an object which has, say, 10 properties. It'd just take too long. There must be a better way, right? Well, there is. You can use the `typedef` function, exported from _argtyper_:

```javascript
var typedef = require('argtyper').typedef
```

This is a very useful little function. Here's an example of its use:

```javascript
typedef(Vector => ({x: Number, y: Number}))

function addThreeVectors (a=Vector, b=Vector, c=Vector) {
	...
}
```

Much nicer! And also exactly 100% identical to the previous function, as the aliases are automatically expanded upon parsing.

Now, not only can you make an alias for an object (like the example above) but you can actually make an alias for any of the following types:

 - Objects
 - Arrays
 - Actually, anything you can write as a constraint normally
 - Even other aliases

Here are some (completely trivial) examples using a some alias types mentioned above:

```javascript
typedef(ThreeNumbers => [Number, Number, Number])
typedef(AddOperand => Any(Number, String))
typedef(ThreeAddOperands => [AddOperand, AddOperand, AddOperand])

function sumThree (a=ThreeNumbers) {
	return a[0] + a[1] + a[2]
}

function add (a=AddOperand, b=AddOperand) {
	return a + b
}

function addThree (ops=ThreeAddOperands) {
	return ops[0] + ops[1] + ops[2]
}
```

(I didn't call type on the functions defined. In real life, you'd need to, but to make it more readable I didn't in this example. I also probably won't in other examples)

#### Aliases to shorten type names

Here's another really useful use of aliases:

```javascript
typedef(N => Number)
```

As I mentioned earlier, aliases can be defined as _any_ valid constraint. Therefore, you can also use them to just shorten class names:

```javascript
function add (a=N, b=N) {
	return a + b
}
```