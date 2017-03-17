'use strict';

module.exports = function type(fn, types) {
  const argString = fn.toString().match(/\((.*)\)/)[1]; // Get arguments

  if (argString.length === 0) return fn; // If there are no arguments, just
                                         // return the original function.

  let args = argString.match(/[^,]+|[^=]+=(\[[^[]+\])/g); // Split arguments

  args = args.map((arg, index) => {
  	arg = arg.replace(/^,\s+/, '') // Remove commas

    if (arg.match(/[^=]+/)[0] === arg) { // If the argument is untyped
      return { // Return an object with an no types
        name: arg,
        types: [null]
      }
    }

    arg = arg.match(/([^=]+)/g); // Extract name and type

    const types = eval(arg[1]); // Evaluate type to get a constructor or array
                                // of constructors

    const constructor = types.constructor;

    if (constructor === Array) { // If there are multiple types
      return { // Return those types
        name: arg[0],
        types: types
      };
    } else if (constructor === Function) { // Otherwise, it is probably a constructor
      return { // In which case, return an array containing that constructor
        name: arg[0],
        types: [types]
      }
    }

    return {
      name: arg[0],
      types: types
    }
  });

  // Return a new function. This function performs type checking and if the
  // checks were successful, calls the base function and returns that.
  return function() {
    if (arguments.length !== args.length) { // If there are the wrong amount of arguments
      throw new Error( // Return an error
        `Wrong number of arguments: Expecting ${args.length} and found ${arguments.length}.`
      );
    }

    for (let i = 0; i < arguments.length; i++) { // Loop the arguments
    	const arg = arguments[i], // Get the current argument
      	type = arg.constructor, // Find its type
        requiredArg = args[i]; // Check what would be allowed

      if (args[i]) { // If the argument is typed
        const allowedTypes = args[i].types; // Get an array of the allowed types
        let allowed = false; // Initialise as false. Will be set to true if any
                             // input arguments are the correct type

        for (let allowedType of allowedTypes) { // Loop the allowed types
          if (allowedType === null // If the type of the argument is okay
              || arg instanceof allowedType
              || arg.constructor === allowedType) {

            allowed = true; // The argument is allowed
          }
        }

        if (!allowed) { // If the type was wrong
          if (allowedTypes.indexOf(String) > -1) { // Cast to a string if it will help
            arguments[i] = arguments[i].toString()
          } else { // Otherwise, throw a type error
            throw new Error(
              `Invalid type (arg ${i + 1}): Expecting one of [${allowedTypes.map((type, index) => {
                return (index === 0 ? '' : ' ') + type.name;
              })}] and found ${type.name}.`
            );
          }
        }
      }
    }

    return fn(...arguments); // If the arguments are okay, call the function
  };
}
