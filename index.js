var GenericFunction = function (docstring, callResolverIdentifier) {
  this.methods = []
  this.docstring = docstring
  this.callResolverIdentifier = callResolverIdentifier
}

GenericFunction.prototype.call = function (context, args) {
  var mathchingMethods = this.methods.filter((method) => method.check.apply(context, args))
  return this.callResolver(mathchingMethods, context, args)
}

GenericFunction.prototype.defmethod = function (check, executor) {
  return this.methods.push({check, executor})
}

GenericFunction.prototype.firstMethodCallResolver = function (matchingMethods, context, args) {
  if (matchingMethods.length >= 1) {
    return matchingMethods[0].executor.apply(context, args)
  } else {
    throw new ReferenceError("call to generic function with docstring '" + this.docstring + "': no matching method found for the arguments " + args.toString())
  }
}

GenericFunction.prototype.warningCallResolver = function (matchingMethods, context, args) {
  if (matchingMethods.length > 1) {
    console.warn("generic function warning: more than one methods match the given arguments " + args.toString() + ", arbitarily selecting the first one")
  }
  return this.firstMethodCallResolver(matchingMethods, context, args)
}

GenericFunction.prototype.strictCallResolver = function (matchingMethods, context, args) {
  if (matchingMethods.length > 1) {
    throw new RangeError("generic function does not have discreetely partitioned domain, multiple methods match the given arguments " + args.toString())
  } else {
    return this.defaultCallResolver(matchingMethods, context, args)
  }
}

GenericFunction.prototype.callResolver = function (matchingMethods, context, args) {
  switch (this.callResolverIdentifier) {
    case "first-method": return this.firstMethodCallResolver(matchingMethods, context, args)
    case "strict": return this.strictCallResolver(matchingMethods, context, args)
    default: return this.warningCallResolver(matchingMethods, context, args)
  }
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