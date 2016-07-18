var assert = require("assert")
var _ = require("lodash")
var defgeneric = require("../index.js")
var sinon = require("sinon")
require("mocha-sinon")
describe("js-multiple-dispatch", function () {
  it("should return a function", function () {
    var add = defgeneric("testing")
    assert(_.isFunction(add))
  })
  
  it("works with one defined method", function () {
    var add = defgeneric("testing")
    
    add.defmethod(
      (a, b) => _.isNumber(a) && _.isNumber(b),
      function (a, b) {
        return a + b
      })
    
    assert(add(1,2) == 3)
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
  
  describe("sugar", function () {
    it("should allow defmethod chaining", function () {
      var add = defgeneric("testing")

      add
        .defmethod(
          (a, b) => _.isNumber(a) && _.isNumber(b),
          function (a, b) {
            return a + b
          })
        .defmethod(
          (a) => _.isArray(a),
          function (a) {
            return a.reduce((a, b) => add(a, b))
          })

      assert(add(1, 2) == 3)
      assert(add([1,2,3]) == 6)
    })
  })
  
  describe("method domain overlapping", function () {
    it("should emit warning (by default) when arguments satisfy check functions of multiple methods", function () {
      //hack: http://stackoverflow.com/a/30626035/1412255 aka something I don't understand
      var stub = this.sinon.stub(console, 'warn')
      var test = defgeneric("testing")
    
      test
        .defmethod(
        (a) => a > 3,
        function (a) {
          return a
        })
        .defmethod(
        (a) => a < 5,
        function (a) {
          return a
        })
      
      test(4)
      assert(console.warn.callCount === 1)
      
      test(6)
      assert(console.warn.callCount === 1)
    })
    
    it("should throw error in strict mode when domain overlaps", function () {
      var test = defgeneric("testing", "strict")
    
      test
        .defmethod(
        (a) => a > 3,
        function (a) {
          return a
        })
        .defmethod(
        (a) => a < 5,
        function (a) {
          return a
        })
      
      var threw = false
      try {
        test(4)
      } catch (e) {
        threw = true
      }
      
      assert(threw === true)
      assert(test(6) === 6) //no throw
    })
    
    it("shouldn't throw error or emit warning in first-method mode", function () {
      var stub = this.sinon.stub(console, 'warn')
      var test = defgeneric("testing", "first-method")
      
      test
        .defmethod(
        (a) => a > 3,
        function (a) {
          return a
        })
        .defmethod(
        (a) => a < 5,
        function (a) {
          return a
        })
      
      var threw = false
      try {
        test(4)
      } catch (e) {
        threw = true
      }
      
      assert(threw === false)
      assert(console.warn.callCount === 0)
    })
  })
})