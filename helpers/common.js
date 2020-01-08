// compose :: ((a -> b), (b -> c),  ..., (y -> z)) -> a -> z
const compose = (...fns) => (...args) =>
  fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];

// functional approach to if-else clause
// ifElse(cond: Boolean, if: Function, else: Function) -> Function
const ifElse = (cond, ifCondTruthy, ifCondFalsy) =>
  cond ? ifCondTruthy : ifCondFalsy;

// curry :: ((a, b, ...) -> c) -> a -> b -> ... -> c
function curry(fn) {
  const arity = fn.length;

  return function $curry(...args) {
    if (args.length < arity) {
      return $curry.bind(null, ...args);
    }

    return fn.call(null, ...args);
  };
}

module.exports = {
  compose,
  ifElse,
  curry,
};
