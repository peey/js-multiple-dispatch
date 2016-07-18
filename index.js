var GenericFunction = function (docstring, callResolverIdentifier) {
  this.methods = []
  this.docstring = docstring
  this.callResolverIdentifier = callResolverIdentifier
}

GenericFunction.prototype.call = function (methodCallContext, methodCallArgs) {
  var mathchingMethods = this.methods.filter((method) => method.check.apply(methodCallContext, methodCallArgs))
  return this.callResolver(mathchingMethods, methodCallContext, methodCallArgs)
}

GenericFunction.prototype.defmethod = function (check, executor) {
  return this.methods.push({check, executor})
}

GenericFunction.prototype.firstMethodCallResolver = function (matchingMethods, methodCallContext, methodCallArgs) {
  if (matchingMethods.length >= 1) {
    return matchingMethods[0].executor.apply(methodCallContext, methodCallArgs)
  } else {
    throw new ReferenceError("call to generic function with docstring '" + this.docstring + "': no matching method found for the arguments " + methodCallArgs.toString())
  }
}

GenericFunction.prototype.warningCallResolver = function (matchingMethods, methodCallContext, methodCallArgs) {
  if (matchingMethods.length > 1) {
    console.warn("generic function warning: more than one methods match the given arguments " + methodCallArgs.toString() + ", arbitarily selecting the first one")
  }
  return this.firstMethodCallResolver(matchingMethods, methodCallContext, methodCallArgs)
}

GenericFunction.prototype.strictCallResolver = function (matchingMethods, methodCallContext, methodCallArgs) {
  if (matchingMethods.length > 1) {
    throw new RangeError("generic function does not have discreetely partitioned domain, multiple methods match the given arguments " + methodCallArgs.toString())
  } else {
    return this.firstMethodCallResolver(matchingMethods, methodCallContext, methodCallArgs)
  }
}

GenericFunction.prototype.callResolver = function (matchingMethods, methodCallContext, methodCallArgs) {
  //this "resolution" is what I've termed the act of determining what to do after check functions have been run
  //i.e. you might want to throw an error on domain overlap / arguments satisfying multiple methods' check functions
  //or emit warning (default behavior)
  //or do nothing and just run the first found method
  switch (this.callResolverIdentifier) {
    case "first-method": return this.firstMethodCallResolver(matchingMethods, methodCallContext, methodCallArgs)
    case "strict": return this.strictCallResolver(matchingMethods, methodCallContext, methodCallArgs)
    default: return this.warningCallResolver(matchingMethods, methodCallContext, methodCallArgs)
  }
}

var defgeneric = function (docstring, callResolverIdentifier) {
  var genericFunction = new GenericFunction(docstring, callResolverIdentifier) //has-a relationship
  
  var call = function (...methodCallArgs) {
    return genericFunction.call(this, methodCallArgs)
  }
  
  return Object.assign(call, {
    defmethod: function (...args) {
      genericFunction.defmethod(...args)
      return call //for method call chaining
    }
  })
}

module.exports = defgeneric