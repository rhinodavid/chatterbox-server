const url = require('url');
var defaultCorsHeaders;

var chats = [{roomname: 'lobby', username: 'tester', createdAt: '2016-10-03T18:46:16.210Z', updatedAt: '2016-10-03T18:46:16.210Z', text: 'Message text here.'}];

var requestHandler = function(request, response) {

  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  const parsedUrl = url.parse(request.url);

  if (parsedUrl.path === '/classes/messages' && request.method === 'GET') {
    // return saved messages
    const statusCode = 200;
    const headers = defaultCorsHeaders;
    headers['Content-Type'] = 'text/json';
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify({results: chats}));
  } else if (parsedUrl.path === '/classes/messages' && request.method === 'POST') {
    const statusCode = 200;
    const headers = defaultCorsHeaders;
    headers['Content-Type'] = 'text/json';
    response.writeHead(statusCode, headers);
    
    debugger;


  } else {
    var statusCode = 200;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'text/plain';
    response.writeHead(statusCode, headers);
    response.end('Hello, World!');
  }

};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};


module.exports = requestHandler;