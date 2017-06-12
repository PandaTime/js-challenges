
function carry(fn) {
  // getting number of args
  let numArgs = fn.length;
  let sendArgs = [];
  const f = function(y) {
    sendArgs.push(y);
    if (numArgs === sendArgs.length) {
      return fn.apply(null, sendArgs);
    }
    return f
  }
  return f;
}
