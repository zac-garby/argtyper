'use strict';

module.exports = function type(fn) {
  const argString = fn.toString().match(/\((.+)\)/)[1]; // Get arguments
  let args = argString.match(/[^=]+=(\[[^[]+\])/g);     // Split arguments

  args = args.map((arg) => {
  	arg = arg
      .replace(/^,\s+/, '')  // Remove commas
      .match(/([^=]+)/g);    // Extract name and type

    const types = arg[1]
      .slice(1, arg[1].length - 1)
      .match(/[^, ]+/g)
      .map((type) => {
        return window[type]
      });

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
          if (arg.constructor === allowedType) {
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
