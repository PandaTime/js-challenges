function seq(fn) {
  let prevValues = [];
  return function() {
    let result = fn(...prevValues);
    prevValues.unshift(result);
    return result;
  }
}
