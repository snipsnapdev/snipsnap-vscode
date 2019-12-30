// compose :: ((a -> b), (b -> c),  ..., (y -> z)) -> a -> z
const compose = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];

// functional approach to if-else clause
// ifElse(cond: Boolean, if: Function, else: Function) -> Function
const ifElse = (cond, ifCondTruthy, ifCondFalsy) => (cond ? ifCondTruthy : ifCondFalsy);

module.exports = {
  compose,
  ifElse,
};
