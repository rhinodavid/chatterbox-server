var handler = require('../request-handler');
var expect = require('chai').expect;
var stubs = require('./Stubs');

// Conditional async testing, akin to Jasmine's waitsFor()
// Will wait for test to be truthy before executing callback
var waitForThen = function (test, cb) {
  setTimeout(function() {
    test() ? cb.apply(this) : waitForThen(test, cb);
  }, 5);
};

describe('Node Server Request Listener Function', function() {
  it('Should answer GET requests for /classes/messages with a 200 status code', function() {
    // This is a fake server request. Normally, the server would provide this,
    // but we want to test our function's behavior totally independent of the server code
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    expect(res._ended).to.equal(true);
  });

  it('Should send back parsable stringified JSON', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(JSON.parse.bind(this, res._data)).to.not.throw();
    expect(res._ended).to.equal(true);
  });

  it('Should send back an object', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    var parsedBody = JSON.parse(res._data);
    expect(parsedBody).to.be.an('object');
    expect(res._ended).to.equal(true);
  });

  it('Should send an object containing a `results` array', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    var parsedBody = JSON.parse(res._data);
    expect(parsedBody).to.have.property('results');
    expect(parsedBody.results).to.be.an('array');
    expect(res._ended).to.equal(true);
  });

  it('Should accept posts to /classes/messages', function() {
    var stubMsg = {
      username: 'Jono',
      text: 'Do my bidding!'
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);

    // Expect 201 Created response status
    expect(res._responseCode).to.equal(201);

    expect(res._data.createdAt).to.be.defined;
    expect(res._data.objectId).to.be.defined;
    expect(res._ended).to.equal(true);
  });

  it('Should respond with messages that were previously posted', function() {
    var stubMsg = {
      username: 'Jono',
      text: 'Do my bidding!'
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(201);

    // Now if we request the log for that room the message we posted should be there:
    req = new stubs.request('/classes/messages', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    var messages = JSON.parse(res._data).results;
    expect(messages.length).to.be.above(0);
    expect(messages[0].username).to.equal('Jono');
    expect(messages[0].text).to.equal('Do my bidding!');
    expect(res._ended).to.equal(true);
  });


  it('Should 404 when asked for a nonexistent file', function() {
    var req = new stubs.request('/arglebargle', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    // Wait for response to return and then check status code
    waitForThen(
      function() { return res._ended; },
      function() {
        expect(res._responseCode).to.equal(404);
      });
  });

});

describe('Chat client file serving', function() {
  it('should respond with a 200 status code when visiting \'/\'', function() {
    var req = new stubs.request('/', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    waitForThen(
      function() { return res._ended; },
      function() {
        expect(res._responseCode).to.equal(200);
      });
  });

  it('should return html when visiting \'/\'', function() {
    var req = new stubs.request('/', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);
    waitForThen(
      function() { return res._ended; },
      function() {
        var match = res._data.match(/<!doctype html>/ig);
        expect(match.length).to.be.above(0);
      });
  });

  it('should set a css Content-Type when serving stylesheets', function() {
    var req = new stubs.request('/styles/styles.css', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);
    waitForThen(
      function() { return res._ended; },
      function() {
        expect(res._headers['Content-Type']).to.equal('text/css');
      });
  });

  it('should set a javascript Content-Type when serving javascript files', function() {
    var req = new stubs.request('/scripts/app.js', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);
    waitForThen(
      function() { return res._ended; },
      function() {
        expect(res._headers['Content-Type']).to.equal('text/javascript');
      });
  });
});