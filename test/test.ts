import * as assert from 'assert'
import * as vm from 'vm'
import devalue from '../src/index'

// eslint-disable-next-line no-console
console.warn = jest.fn()

describe('devalue', () => {
  function test (name: string, input: any, expected: string) {
    it(name, () => {
      const actual = devalue(input)
      expect(actual).toBe(expected)
    })
  }

  class ToJSONTest {
    private toJSONValue: any
    constructor (toJSONValue: any) {
      this.toJSONValue = toJSONValue
    }

    toJSON () {
      return this.toJSONValue
    }
  }

  describe('basics', () => {
    test('number', 42, '42')
    test('negative number', -42, '-42')
    test('negative zero', -0, '-0')
    test('positive decimal', 0.1, '.1')
    test('negative decimal', -0.1, '-.1')
    test('string', 'woo!!!', '"woo!!!"')
    test('boolean', true, 'true')
    // test('Number', Number(42), 'Object(42)')
    // test('String', String('yar'), 'Object("yar")')
    // test('Boolean', Boolean(false), 'Object(false)')
    test('undefined', undefined, 'void 0')
    test('null', null, 'null')
    test('NaN', NaN, 'NaN')
    test('Infinity', Infinity, 'Infinity')
    test('RegExp', /regexp/img, '/regexp/gim')
    test('Date', new Date(1e12), 'new Date(1000000000000)')
    test('Array', ['a', 'b', 'c'], '["a","b","c"]')
    test('Array (empty)', [], '[]')
    // test('Array (sparse)', [undefined, 'b', undefined, undefined], '[,"b",,]')
    test('Object', { foo: 'bar', 'x-y': 'z' }, '{foo:"bar","x-y":"z"}')
    test('Set', new Set([1, 2, 3]), 'new Set([1,2,3])')
    test('Map', new Map([['a', 'b']]), 'new Map([["a","b"]])')
    test('toJSON (string) Array', new ToJSONTest('["a", "b", "c"]'), '["a","b","c"]')
    test('toJSON (string) Array (empty)', new ToJSONTest('[]'), '[]')
    test('toJSON (string) Object', new ToJSONTest('{"foo":"bar","x-y":"z"}'), '{foo:"bar","x-y":"z"}')
    test('toJSON (string) (deep)', new ToJSONTest('{"foo":"bar","x-y": [1,2,{"a":"b"}]}'), '{foo:"bar","x-y":[1,2,{a:"b"}]}')
    test('toJSON (string) Boolean', new ToJSONTest('true'), 'true')
    test('toJSON (string) Number', new ToJSONTest('1'), '1')
    test('toJSON (string) String', new ToJSONTest('"test"'), '"test"')
    test('toJSON Array', new ToJSONTest(['a', 'b', 'c']), '["a","b","c"]')
    test('toJSON Array (empty)', new ToJSONTest([]), '[]')
    test('toJSON Object', new ToJSONTest({ foo: 'bar', 'x-y': 'z' }), '{foo:"bar","x-y":"z"}')
    test('toJSON Object (deep)', new ToJSONTest({ foo: 'bar', 'x-y': [1, 2, { a: 'b' }] }), '{foo:"bar","x-y":[1,2,{a:"b"}]}')
    test('toJSON Boolean', new ToJSONTest(true), 'true')
    test('toJSON Number', new ToJSONTest(1), '1')
    test('toJSON String', new ToJSONTest('test'), '"test"')
  })

  describe('strings', () => {
    test('newline', 'a\nb', JSON.stringify('a\nb'))
    test('double quotes', '"yar"', JSON.stringify('"yar"'))
    test('lone low surrogate', 'a\uDC00b', '"a\\uDC00b"')
    test('lone high surrogate', 'a\uD800b', '"a\\uD800b"')
    test('two low surrogates', 'a\uDC00\uDC00b', '"a\\uDC00\\uDC00b"')
    test('two high surrogates', 'a\uD800\uD800b', '"a\\uD800\\uD800b"')
    test('surrogate pair', '𝌆', JSON.stringify('𝌆'))
    test('surrogate pair in wrong order', 'a\uDC00\uD800b', '"a\\uDC00\\uD800b"')
    test('nul', '\0', '"\\0"')
    test('backslash', '\\', JSON.stringify('\\'))
  })

  describe('cycles', () => {
    const map = new Map()
    map.set('self', map)
    test('Map (cyclical)', map, '(function(a){a.set("self", a);return a}(new Map))')

    const set = new Set()
    set.add(set)
    set.add(42)
    test('Set (cyclical)', set, '(function(a){a.add(a).add(42);return a}(new Set))')

    const arr: any[] = []
    arr[0] = arr
    test('Array (cyclical)', arr, '(function(a){a[0]=a;return a}(Array(1)))')

    const obj: any = {}
    obj.self = obj
    test('Object (cyclical)', obj, '(function(a){a.self=a;return a}({}))')

    const objFromNull: any = Object.create(null)
    objFromNull.self = objFromNull
    test('Object (cyclical)', objFromNull, '(function(a){a.self=a;return a}(Object.create(null)))')

    const first: any = {}
    const second: any = {}
    first.second = second
    second.first = first
    test('Object (cyclical)', [first, second], '(function(a,b){a.second=b;b.first=a;return [a,b]}({},{}))')
  })

  describe('repetition', () => {
    const str = 'a string'
    test('String (repetition)', [str, str], '(function(a){return [a,a]}("a string"))')
  })

  describe('XSS', () => {
    test(
      'Dangerous string',
      '</script><script src=\'https://evil.com/script.js\'>alert(\'pwned\')</script><script>',
      '"\\u003C\\u002Fscript\\u003E\\u003Cscript src=\'https:\\u002F\\u002Fevil.com\\u002Fscript.js\'\\u003Ealert(\'pwned\')\\u003C\\u002Fscript\\u003E\\u003Cscript\\u003E"'
    )
    test(
      'toJSON Dangerous string',
      new ToJSONTest('"</script><script src=\'https://evil.com/script.js\'>alert(\'pwned\')</script><script>"'),
      '"\\u003C\\u002Fscript\\u003E\\u003Cscript src=\'https:\\u002F\\u002Fevil.com\\u002Fscript.js\'\\u003Ealert(\'pwned\')\\u003C\\u002Fscript\\u003E\\u003Cscript\\u003E"'
    )
    test(
      'Dangerous key',
      { '<svg onload=alert("xss_works")>': 'bar' },
      '{"\\u003Csvg onload=alert(\\"xss_works\\")\\u003E":"bar"}'
    )
  })

  describe('misc', () => {
    test('Object without prototype', Object.create(null), 'Object.create(null)')

    test('Object without prototype with values', Object.assign(Object.create(null), { foo: 1 }), 'Object.create(null,{foo:{writable:true,enumerable:true,value:1}})')

    // let arr = [];
    // arr.x = 42;
    // test('Array with named properties', arr, `TODO`);

    test('cross-realm POJO', vm.runInNewContext('({})'), '{}')
    //
    // it('throws for non-POJOs', () => {
    //   class Foo {}
    //   const foo = new Foo();
    //   assert.throws(() => devalue(foo));
    // });
    //
    test('objects with symbolic keys', { [Symbol('')]: null, key: 'val' }, '{key:"val"}')

    it('do not have duplicates in generated argument names', () => {
      const foo = new Array(20000).fill(0).map((_, i) => i)
      const bar = foo.map((_, i) => ({ [i]: foo[i] }))
      const serialized = devalue([foo, ...bar])

      // eslint-disable-next-line no-eval
      assert.doesNotThrow(() => eval(serialized), /Duplicate parameter name/)
    })
  })
})
