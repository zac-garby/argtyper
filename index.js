function type(fn) {
  const argString = fn.toString().match(/\((.+)\)/)[1];
  let args = argString.match(/[^=]+=([^,]+)/g);

  args = args.map((arg) => {
  	arg = arg
    	.replace(/,\s/, '')
    	.match(/([^=]+)=(.+)/)
      .splice(1, 2);

    const typeStr = arg[1].match(/\s*(.+)\s*/)[1];

    return {
    	name: arg[0],
      type: window[typeStr]
    };
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
        const requiredType = args[i].type;

        if (arg.constructor !== requiredType) {
          throw new Error(
            `Invalid type (arg ${i + 1}): Expecting ${requiredType.name} and found ${type.name}.`
          );
        }
      }
    }

    return fn(...arguments);
  };
}

module.exports = {
  type,
  typeAll
};
