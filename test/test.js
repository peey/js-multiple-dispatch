var assert = require("assert")
var _ = require("lodash")
var defgeneric = require("../index.js")

describe("js-multiple-dispatch", function () {
  it("should return a function", function () {
    var add = defgeneric("testing")
    assert(_.isFunction(add))
  })
  
  it("should call different methods based on argument checks", function () {
    var add = defgeneric("testing")
    
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
  })
  
  it("should throw when no matching methods are found", function () {
    var test = defgeneric("testing")
    
    test.defmethod(
      (a) => a === true,
      function (a) {
        return a
      })
    
    var threw = false
    
    try {
      test(false)
    } catch (e) {
      threw = true
    }
    
    assert(threw === true)
  })
})