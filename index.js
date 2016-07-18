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
      throw new ReferenceError("call to generic function with docstring '" + docstring + "': no matching method found for the arguments " + args.toString())
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

module.exports = defgeneric