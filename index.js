var assert = require("assert")

var GenericFunction = function (docstring) {
  this.methods = []
  this.docstring = docstring
}

GenericFunction.prototype.call = function (context, args) {
  var found = this.methods.find((method) => method.check.apply(context, args))
  if (found) {
    return found.executor.apply(context, args)
  } else {
    throw new ReferenceError("call to generic function with docstring '" + this.docstring + "': no matching method found for the arguments " + args.toString())
  }
}

GenericFunction.prototype.defmethod = function (check, executor) {
  return this.methods.push({check, executor})
}

var defgeneric = function (docstring) {
  var genericFunction = new GenericFunction(docstring) //has-a relationship
  
  var call = function (...args) {
    return genericFunction.call(this, args)
  }
  
  return Object.assign(call, {
    defmethod: function (...args) {
      genericFunction.defmethod(...args)
      return call //for method call chaining
    }
  })
}

module.exports = defgeneric