'use strict';

module.exports = function type(fn, types) {
  const argString = fn.toString().match(/\((.*)\)/)[1]; // Get arguments

  if (argString.length === 0) return fn;

  let args = argString.match(/[^,]+|[^=]+=(\[[^[]+\])/g); // Split arguments

  args = args.map((arg, index) => {
  	arg = arg.replace(/^,\s+/, '') // Remove commas

    if (arg.match(/[^=]+/)[0] === arg) {
      return {
        name: arg,
        types: [null]
      }
    }

    arg = arg.match(/([^=]+)/g); // Extract name and type

    const types = eval(arg[1]);
    const constructor = types.constructor;

    if (constructor === Array) {
      return {
        name: arg[0],
        types: types
      };
    } else if (constructor === Function) {
      return {
        name: arg[0],
        types: [types]
      }
    }

    return {
      name: arg[0],
      types: types
    }
  });

  return function() {
    if (arguments.length !== args.length) {
      throw new Error(
        `Wrong number of arguments: Expecting ${args.length} and found ${arguments.length}.`
      );
    }

    for (let i = 0; i < arguments.length; i++) {
    	const arg = arguments[i],
      	type = arg.constructor,
        requiredArg = args[i];

      if (args[i]) {
        const allowedTypes = args[i].types;
        let allowed = false;

        for (let allowedType of allowedTypes) {
          if (allowedType === null
              || arg instanceof allowedType
              || arg.constructor === allowedType) {

            allowed = true;
          }
        }

        if (!allowed) {
          throw new Error(
            `Invalid type (arg ${i + 1}): Expecting one of [${allowedTypes.map((type, index) => {
              return (index === 0 ? '' : ' ') + type.name;
            })}] and found ${type.name}.`
          );
        }
      }
    }

    return fn(...arguments);
  };
}
