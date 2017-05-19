# argtyper

This project is hosted on [GitHub](https://github.com/Zac-Garby/argtyper)

### JS Type-Constraints without compilation.

Type checking is very useful in JavaScript - it helps catch a number of different bugs.
However, to actually use type checking normally, you'd install a library such as Flow,
which is great, but you have to compile your program. This not only takes time, but is
annoying to set up.

_argtyper_ is a better way to implement type checking for function arguments and
return types.

### Features

 - **Argument types**
 - **Function return types**
 - **Type aliases** -- e.g. `Vector` &rarr; `{ x: Number, y: Number }`
 - **Deep array and object typing** -- e.g. `[Number, [Number, [String, Number]]]`
 - **Polymorphic types** -- e.g. `Number | String` &rarr; Either a number or a string
 - **Repeated types** -- e.g. `[Number * 5]` &rarr; An array of five numbers
 - **Arrays of any length** -- e.g. `[...Number]` &rarr; An array of any amount of numbers

## Installation

If you're using npm, you can just run this command to install
[_argtyper_](https://www.npmjs.com/package/argtyper):

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

### Syntax overview

#### Function syntax

The simplest sort of typing _argtyper_ supports is typing the arguments of a
function, as demonstrated above:

```javascript
function fn (a=Number, b=String) {
  ...
}

fn = type(fn) // Remember to call 'type'!
```

This function would only accept two arguments. The first would would have to
be a number, and the second would have to be a string. If any of these requirements
were not met, an error would be thrown.

---

You can also give a function a return type. This is only possible with arrow
functions, due to the syntax of them:

```javascript
let add = (a=Number | String, b=Number | String) => String => {
  return a + b
}

add = type(add)
```

Don't worry about the `Number | String` notation, it will be explained in the
next section.

This function takes two arguments, _a_ and _b_, both of them being either
a number or a string. The function can, however, _only_ return a string -
otherwise it will return an error

---

If you want to use a more complex constraint as the return type, there are two
ways of doing so.

Firstly, you could use `(_=Constraint)` notation:
```javascript
let fn = (...) => (_=Number | String) => {
  ...
}
```

This means you can use any of the constraints defined below, because without
using this syntax, javascript's grammar won't allow your function.

The second way is to define an alias for your complex type, turning it into a
simple identifier:

```javascript
typedef(Vector => { x: Number, y: Number })
```

Then, you can just define your function like:

```javascript
let fn = (...) => Vector => {
  ...
}
```

#### Constraints

There are many different types of constraints in _argtyper_. Here's a list!

 - `ClassName` - The simplest constraint, which you've already seen in the earlier
   examples, is just a single class name, such as _Number_ or _String_.
    - Don't use _Array_ or _Object_ as a class name, as they are to be written
      using their own syntax (described below.)
    - Also don't use _Any_, because it's it's own separate thing.
    - Example: `Number` allows a number

 - `[Constraint, Constraint ...]` - When having an array as an argument to a
   function, you specify the types for each element of that array. The syntax is
   very similar to defining a normal array, except each element of the
   constraining array should be another constraint (i.e. a class name,
   another array, etc...)
    - Example: `[Number, String, [Number, Number, Number]]` allows an array
      where the first element is a number, the second a string, and the third
      another array containing three numbers.

 - `{x: Constraint, y: Constraint ...}` - You can add an object constraint in a
   similar fashion to an array. Again, you use the exact same syntax as writing
   an object, just each property's value should be another constraint.
    - Example: `{x: Number, y: Number}` allows a two-dimensional vector in the
      form of an object with an x and y field, both numbers.

 - `Constraint | Constraint[ | Constraint ...]` - It's also possible for an argument to
   accept multiple types, using the `|` operator. It's fairly simple - here's
   an example:
    - Example: `Number | String | Boolean` allows a number, string, or boolean

 - `Any` - The word _Any_ on its own just allows anything through. It's how
   you can make an untyped argument in _argtyper_.

 - `[Constraint * amount]` - Is the same as writing
   `[Constraint, Constraint ... (amount times)]`.
    - Example: `[Number * 10]` allows an array of 10 numbers

 - `[...Constraint]` - A list of any size (except from 0) containing only
   `Constraint`s.
    - Example: `[...String]` allows an array of any size > 0 of strings

### Aliases - `typedef(Name => Constraint)`

Say you're writing a game. You'd probably use a lot of Vectors for velocity,
position etc... In _argtyper_, you might represent a vector similar to the
following:

```javascript
function addThreeVectors (
  a={x: Number, y: Number},
  b={x: Number, y: Number},
  c={x: Number, y: Number}
) {
  ...
}
```

But as you can see, it just takes too long to write. And imagine if you repeatedly
used an object which has, say, 10 properties. It'd just take too long. There must
be a better way, right? Well, there is. You can use the `typedef` function,
exported from _argtyper_:

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

Much nicer! And also exactly 100% identical to the previous function, as the
aliases are automatically expanded upon parsing.

Now, not only can you make an alias for an object (like the example above) but
you can actually make an alias for any of the following types:

 - Objects
 - Arrays
 - Actually, anything you can write as a constraint normally
 - Even other aliases

Here are some (completely trivial) examples using a some alias types mentioned
above:

```javascript
typedef(ThreeNumbers => [Number, Number, Number])
typedef(AddOperand => Number | String)
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

(I didn't call type on the functions defined. In real life, you'd need to, but
to make it more readable I didn't in this example. I also probably won't in
other examples)

#### Aliases to shorten type names

Here's another really useful use of aliases:

```javascript
typedef(N => Number)
```

As I mentioned earlier, aliases can be defined as _any_ valid constraint.
Therefore, you can also use them to just shorten class names:

```javascript
function add (a=N, b=N) {
  return a + b
}
```

### Repetition - `[Constraint * n]`

Sometimes, you want an array with lots of elements in it. Here's an example:

```javascript
function sumOneHundred (a=[Number, Number, Number ... Number]) {
  return a.reduce((a, b) => a + b, 0)
}
```

(I omitted 96 `Number`s, but you can imagine how long it'd be if I wrote them all out)

There's a better way to do this, of course. You can use the `*` operator:

```javascript
function sumOneHundred (a=[Number * 100]) {
  return a.reduce((a, b) => a + b, 0)
}
```

As you can see, this looks a lot better.

To pass the one hundred arguments to this function, you'd do the following:

```javascript
sumOneHundred([7, 2, 3, 10, 4, ...])
```

But obviously just a whole lot more elements in the array.

#### Infinite repetition

You can also define a constraint which matches a list of any size greater than 0
using the spread (`...`) operator:

```javascript
function sumN (xs=[...Number]) {
  return xs.reduce((a, b) => a + b, 0)
}

sumN([1, 2, 3]) //=> 6
sumN([1])       //=> 1
sumN([])        //=> Error
```

If you also want to allow an array of length 0, you can use the following hack,
until I add a special syntax for it:

```javascript
function sumN (xs=[] | [...Number]) {
  return xs.reduce((a, b) => a + b, 0)
}
```

Which works because it can either match an empty array or an array with some
numbers in it.

## Problems

Well, "Problem". Basically, argtyper can be quite slow, so it's probably best not
to use it for applications which need to be very performant.
