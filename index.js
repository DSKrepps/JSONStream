var Parser = require('jsonparse')
  , Stream = require('stream').Stream
  , through = require('through')

exports.parse = function (handler) {

  var parser = new Parser()
  var stream = through(function (chunk) {
    if('string' === typeof chunk) {
      if (process.browser) {
        var buf = new Array(chunk.length)
        for (var i = 0; i < chunk.length; i++) buf[i] = chunk.charCodeAt(i)
        chunk = new Int32Array(buf)
      } else {
        chunk = new Buffer(chunk)
      }
    }
    parser.write(chunk)
  },
  function (data) {
    if(data)
      stream.write(data)
    stream.queue(null)
  })


  parser.onValue = function(value){

    if(value === Object(value))
      return

    var i = 0
      , len = this.stack.length
      , path = []
      , stack = this.stack

    // Add ancestor keys
    while( i < len ){
      if( stack[i].key )
        path.push(stack[i].key);
      i++
    }

    // Add parent key and value
    path.push(this.key, value);
    
    stream.queue(
      handler ? handler.call(this, path)
              : path
    );

  }


  parser.onError = function (err) {
    stream.emit('error', err);
  }


  return stream;
}
