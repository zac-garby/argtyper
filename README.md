# Typed

### A JavaScript argument-type-checker, without the need for preprocessing or compiling.

Type checking is very useful in JavaScript - it helps catch a number of different bugs.
However, to actually use type checking normally, you'd install a library such as Flow,
which is great, but you have to compile your program. This not only takes time, but is
annoying to set up.

Typed, (working title), is a better way to implement type checking for function arguments.
Because of the way it works, it's only _possible_ at the moment to do it for arguments -
sadly not variable declarations. But, that's not a huge problem because most of the bugs
actually come from wrongly typed arguments.

## Example

Here is a basic program using Typed. In it, a simple function, called `add`, is defined,
with two arguments, called _a_ and _b_. Both of them are _Number_ types (the type goes
after the argument name, separated by an equals sign).

```javascript
function add(a=Number, b=Number) {
  return a + b;
}

add = type(add);
```

The last line is very important. The _type_ function wraps a given function in some type
checking code and returns the new one.

Below are some test cases, showing what happens when `add` is executed with different
arguments.

```javascript
// Test cases

add(5, 3)     //=> 8
add(5, true)  //=> Error
add(6, 1, 8)  //=> Error
add(7)        //=> Error
```

## How it works

The entirety of Typed is, at the time of writing, roughly 50 lines long. This shows how
simple it actually is.

It's completely based off the concept of default values of function arguments, as you've
probably noticed. Instead of the default values being used as default values, they are
reparsed and changed to signify the allowed type for the argument. Obviously, this will
mean that, on any functions you are type checking, you won't be able to have default values.

So what the _type_ function actually does is as follows:

 1. Firstly, it finds a string containing the arguments of the given function, using the
    regex `/\((.+\)/`. The string could look something like this: `a=Number, b=Number`.
    
 2. Next, the arguments are split into an array using the regex `/[^=]+=([^,]+)/g`.
    The array will contain some elements, looking something like these: `a=Number` and `, b=Number`.
    
 3. That array is mapped, and for each element in it, a number of things happen.
    1. For any element other than the first, the comma and space is removed from the front.
    2. The argument name and type are extracted using the regex `/([^=]+)=(.+)/`.
    3. The argument is replaced with an object containing the name and type.
    
 4. A new function is then returned which performs type checks and arg length checks, before
    finally executing the given function.
    
## In the future

In the future, I'd like to add some new features:

 - Subclass support
 - Support for more than one type per argument
 - More errors / more descriptive errors
