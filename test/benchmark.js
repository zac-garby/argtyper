const argtyper = require('../js/index')
const perf = require('perf_hooks').performance

const type = argtyper.type

function add(a = Number, b = Number) {
  return a + b
}
const addWithTypes = type(add)
const REPETITIONS = 100000

var i = 0

perf.mark('start without types')
for (i = 0; i < REPETITIONS; i++) {
  add(i, i+1)
}
perf.mark('stop without types')

perf.mark('start with types')
for (i = 0; i < REPETITIONS; i++) {
  addWithTypes(i, i+1)
}
perf.mark('stop with types')
perf.measure('without types', 'start without types', 'stop without types')
perf.measure('with types', 'start with types', 'stop with types')

const measureWithoutTypes = perf.getEntriesByName('without types')[0]
const measureWithTypes = perf.getEntriesByName('with types')[0]

console.log('without types', measureWithoutTypes.duration)
console.log('with types', measureWithTypes.duration)
console.log(`with types is ${measureWithTypes.duration / measureWithoutTypes.duration} times slower`)
