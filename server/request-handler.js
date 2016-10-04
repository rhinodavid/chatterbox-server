'use strict';

const url = require('url');
const fs = require('fs');
var defaultCorsHeaders;
var chats = [];

var Message = function(body) {
  this.text = body.text;
  this.username = body.username || 'anonymous';
  this.roomname = body.roomname || 'lobby';
  this.createdAt = new Date();
  this.updatedAt = this.createdAt;
  this.objectId = chats.length;
};


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
  let headers = defaultCorsHeaders;
  if (parsedUrl.pathname === '/classes/messages' && request.method === 'GET') {
    headers['Content-Type'] = 'application/json';
    response.writeHead(200, headers);
    response.end(JSON.stringify({results: chats}));

  } else if (parsedUrl.pathname === '/classes/messages' && request.method === 'POST') {
    var body = [];
    request.on('data', chunk => {
      body.push(chunk);
    });
    request.on('end', () => {
      try {
        body = body.join('');
        body = JSON.parse(body);
        headers['Content-Type'] = 'application/json';
        response.writeHead(201, headers);
        chats.unshift(new Message(body));
        response.end(JSON.stringify({createdAt: chats[0].createdAt, objectId: chats[0].objectId}));
      } catch (e) {
        headers['Content-Type'] = 'text/plain';
        response.writeHead(400, headers);
        response.end('Invalid request.');
      }
    });

  } else if (parsedUrl.pathname === '/classes/messages' && request.method === 'OPTIONS') {
    response.writeHead(200, Object.assign({}, headers, {'Allow': 'GET, POST, OPTIONS'}));
    response.end();

  } else if (request.method === 'GET') {
    var path = parsedUrl.pathname === '/' ? './client/client/index.html' : './client/client' + parsedUrl.pathname;
    fs.readFile(path, (err, data) => {
      if (err) {
        headers['Content-Type'] = 'text/plain';
        response.writeHead(404, headers);
        response.end('404: File not found');
      } else {
        headers['Content-Type'] = getContentType(path) || 'text/plain';
        response.writeHead(200, headers);
        response.end(data);
      }
    });

  } else {
    headers['Content-Type'] = 'text/plain';
    response.writeHead(404, headers);
    response.end('404: Endpoint not found.');
  }

};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};


module.exports.requestHandler = requestHandler;