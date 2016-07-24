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

//last match to allow for specific-matching..
GenericFunction.prototype.lastMatchCallResolver = function (matchingMethods, methodCallContext, methodCallArgs) {
  if (matchingMethods.length >= 1) {
    return matchingMethods[matchingMethods.length - 1].executor.apply(methodCallContext, methodCallArgs)
  } else {
    throw new NoMatchingMethodError(this.docstring, methodCallArgs)
  }
}

GenericFunction.prototype.warningCallResolver = function (matchingMethods, methodCallContext, methodCallArgs) {
  if (matchingMethods.length > 1) {
    console.warn("generic function warning: more than one methods match the given arguments " + methodCallArgs.toString() + ", arbitarily selecting the first one")
  }
  return this.lastMatchCallResolver(matchingMethods, methodCallContext, methodCallArgs)
}

GenericFunction.prototype.strictCallResolver = function (matchingMethods, methodCallContext, methodCallArgs) {
  if (matchingMethods.length > 1) {
    throw new MultipleMatchingMethodsError(this.docstring, methodCallArgs)
  } else {
    return this.lastMatchCallResolver(matchingMethods, methodCallContext, methodCallArgs)
  }
}

GenericFunction.prototype.callResolver = function (matchingMethods, methodCallContext, methodCallArgs) {
  //this "resolution" is what I've termed the act of determining what to do after check functions have been run
  //i.e. you might want to throw an error on domain overlap / arguments satisfying multiple methods' check functions
  //or emit warning (default behavior)
  //or do nothing and just run the first found method
  switch (this.callResolverIdentifier) {
    case "last-match": return this.lastMatchCallResolver(matchingMethods, methodCallContext, methodCallArgs)
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

var NoMatchingMethodError = function (docstring, args, errObj) {
  Object.assign (
    this,
    errObj? errObj : new Error(), //for properties like stacktrace etc
    {
      name: "generic functions: no matching method error",
      message: "call to generic function failed, no matching method found. Please see .docstring and .args properties of this error for more details" ,
      docstring: docstring,
      offendingArguments: args
    }
  )
}

NoMatchingMethodError.prototype = Object.create(Error.prototype)
NoMatchingMethodError.prototype.constructor = NoMatchingMethodError

var MultipleMatchingMethodsError = function (docstring, args) {
  Object.assign (
    this,
    errObj? errObj : new Error(), //for properties like stacktrace etc
    {
      name: "generic functions: multiple matching methods error",
      message: "generic function does not have discreetely partitioned domain, multiple methods match the given arguments " ,
      docstring: docstring,
      offendingArguments: args
    }
  )
}

MultipleMatchingMethodsError.prototype = Object.create(Error.prototype)
MultipleMatchingMethodsError.prototype.constructor = MultipleMatchingMethodsError

module.exports = {
  defgeneric,
  NoMatchingMethodError,
  MultipleMatchingMethodsError
}