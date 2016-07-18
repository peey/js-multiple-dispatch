var assert = require("assert")
var _ = require("lodash")

var defgeneric = function (docstring) {
  var methods = []
  
  var call = function () {
    var args = Array.prototype.slice.apply(arguments)

    var found = _.find(methods, (method) => method.check.apply(this, args))
    if (found) {
      return found.executor.apply(this, args)
    } else {
      console.log(found, args, methods)
      throw "tantrum"
    }
  }
  
  return _.assign(call, {
    docstring,
    methods,
    defmethod: function (check, executor) {
      methods.push({check, executor})
    }
  })
}

var add = defgeneric("this is a knife")

add.defmethod(
  (a, b) => _.isNumber(a) && _.isNumber(b),
  function (a, b) {
    return a + b
  })

add.defmethod(
  (a) => _.isArray(a),
  function (a) {
    return a.reduce((a, b) => add(a, b))
  })


assert(add(1, 2) == 3)
assert(add([1,2,3]) == 6)

/**
var methods = {}

methods.add = function (a, b) {
  return a + b
}

var old = methods.add
methods.add = function (arr) {
  return arr.reduce((a, b) => old(a, b))

}


*/