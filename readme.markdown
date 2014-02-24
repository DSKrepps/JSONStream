# json-stream-values

Takes a json stream and emits, for each value, an array of keys leading to it, ending with the value itself. Optionally pass a function to alter the array before being emitted.

todo: tests

## Examples

``` js

var jsonStreamValues = require('JSONStream');
var es = require('event-stream');
var Readable = require('stream').Readable;

// Example json stream
var stream = new Readable;
stream.push('{"a":{"b":"c","x":"y"');
stream.push(',"1":{"2":["3","4');
stream.push('"]}}}');
stream.push(null);

var parse = jsonStreamValues.parse();

stream
	.pipe(parse)
	.pipe(es.mapSync(function(data){
		console.log(data);
	}))

/* Logs:
	[ 'a', 'b', 'c' ]
	[ 'a', 'x', 'y' ]
	[ 'a', '1', '2', 0, '3' ]
	[ 'a', '1', '2', 1, '4' ]
*/

```

An example passing a handler function and ignoring array indexes:

``` js

var jsonStreamValues = require('JSONStream');
var es = require('event-stream');
var Readable = require('stream').Readable;

// Example json stream with arrays
var stream = new Readable;
stream.push('{"That":{"is":["cool", "inter');
stream.push('esting", {"very":"awesome"}, 1337]}, ');
stream.push('"isn\'t":[]}'); // *
stream.push(null);
  
var parse = jsonStreamValues.parse(function(path){
	var last = path.length-1;
	return path.filter(function(v, i){
	  // Ignore array indexes (numbers)
	  // but not the value at the end
		return (typeof v == 'string')||(i==last);
	})
})

stream
	.pipe(parse)
	.pipe(es.mapSync(function(data){
		console.log(data);
	}))

/* Logs:
	[ 'That', 'is', 'cool' ]
	[ 'That', 'is', 'interesting' ]
	[ 'That', 'is', 'very', 'awesome' ]
	[ 'That', 'is', 1337 ]
*/

```

\* Note that empty arrays and objects ([] or {}) emit nothing. "That isn't" is not in the output.




## Acknowlegements

Credit goes to Dominic Tarr for [JSONStream](https://github.com/dominictarr/JSONStream) which this is forked from, 
and Tim Caswell for [jsonparse](https://github.com/creationix/jsonparse) which it is dependent on.

## license

MIT / APACHE2
