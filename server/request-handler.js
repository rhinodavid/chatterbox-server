'use strict';

const url = require('url');
const fs = require('fs');
var defaultCorsHeaders;

var chats = [];

var getContentType = function(pathname) {
  var types = {
    css: 'text/css',
    js: 'text/javascript',
    jsx: 'text/javascript',
    html: 'text/html',
    json: 'application/json',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    ico: 'image/x-icon'
  };
  const extension = pathname.split('.').slice(-1)[0];
  return types[extension] || null;
};

var requestHandler = function(request, response) {

  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  const parsedUrl = url.parse(request.url);
  let statusCode;
  let headers;
  if (parsedUrl.pathname === '/classes/messages' && request.method === 'GET') {
    // return saved messages
    statusCode = 200;
    headers = defaultCorsHeaders;
    headers['Content-Type'] = 'application/json';
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify({results: chats}));
  } else if (parsedUrl.pathname === '/classes/messages' && request.method === 'POST') {
    statusCode = 201;
    headers = defaultCorsHeaders;
    headers['Content-Type'] = 'application/json';
    response.writeHead(statusCode, headers);
    var body = [];
    request.on('data', function(chunk) {
      body.push(chunk);
    });
    request.on('end', function() {
      body = body.join('');//Buffer.concat(body).toString();
      //Create a message object
      body = JSON.parse(body);
      var message = {};
      message.text = body.text;
      message.username = body.username || 'User';
      message.roomname = body.roomname || 'lobby';
      message.createdAt = new Date();
      message.updatedAt = message.createdAt;
      message.objectId = chats.length;
      chats.unshift(message);
      response.end(JSON.stringify({createdAt: message.createdAt, objectId: message.objectId}));
    });
  } else if (parsedUrl.pathname === '/classes/messages' && request.method === 'OPTIONS') {
    statusCode = 200;
    headers = defaultCorsHeaders;
    response.writeHead(statusCode, headers);
    response.end();
  } else if (request.method === 'GET') {
    debugger;
    var path = parsedUrl.pathname === '/' ? './client/client/index.html' : './client/client' + parsedUrl.pathname;
    fs.readFile(path, (err, data) => {
      if (err) {
        statusCode = 404;
        headers = defaultCorsHeaders;
        headers['Content-Type'] = 'text/plain';
        response.writeHead(statusCode, headers);
        response.end('404: File not found');
      } else {
        statusCode = 200;
        headers = defaultCorsHeaders;
        headers['Content-Type'] = getContentType(path) || 'text/plain';
        response.writeHead(statusCode, headers);
        response.end(data);
      }
    });
  } else {
    statusCode = 404;
    headers = defaultCorsHeaders;
    headers['Content-Type'] = 'text/plain';
    response.writeHead(statusCode, headers);
    response.end('404: Endpoint not found.');
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
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};


module.exports.requestHandler = requestHandler;