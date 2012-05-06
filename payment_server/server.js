'use strict';

var http = require('http');
var url = require('url');

var apikey = 'd3fb27a1cfa50bea2359b8085c36d46c';
var secretkey = 'e469b04c81506754';

http.createServer(function (req, res) {
  var err, redirecturl;
  var queryString = url.parse(req.url, true);
  if(queryString['TransactionAuthCode']) {
    successful(queryString['TransactionAuthCode'], function(err) {
      if(err) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404');
        return;
      } else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Success');
      }
    });
  } else {
    payment(function(err, redirecturl) {
      if(err) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404');
        return;
      } else {
        res.writeHead(302, {'Location': redirecturl});
        res.end();
      }
    });
  }
}).listen(1337);

function sendPost(host, headers, data, cb) {
  var hostName = url.parse(host);
  var reqOptions = {'hostname': hostName,
                    'port': 443,
                    'method': 'POST',
                    'headers': headers};

  var post = http.request(reqOptions, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      cb(chunk);
    });
    res.on('error', function(err) {
      console.log(err);
    });
  });

  post.write(JSON.stringify(data));
  post.end();
};

function sendGet(url, headers, cb) {
  var hostName = url.parse(host);
  var reqOptions = {'hostname': hostName,
                    'method': 'GET',
                    'headers': headers};

  var get = http.request(reqOptions, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      cb(chunk);
    });
    res.on('error', function(err) {
      console.log(err);
    });
  });

  get.end();
};

//cb = function(err, redirecturl)
function payment(cb) {
  var result;
  var host = 'https://api.att.com/Security/Notary/Rest/1/SignedPayload';
  var headers = {'Content-Type': 'application/json',
                 'Accept': 'application/json',
                 'Client_id': apikey,
                 'Client_secret': secretkey};
  var data = {'Amount': 0.01,
              'Category': 3,
              'Channel': 'MOBILE_WEB',
              'Description': 'TEST',
              'MerchantTransactionId': uuid(),
              'MerchantProductId': 'http://localhost:1337/'
              };

  sendPost(host, headers, data, function(result) {
    var signed = result.data.signeddocument;
    var signature = result.data.signature;
    var redirectUrl = 'http://api/att.com/Commerce/Payment/Rest/2/Transactions?Signature='+signature+'&SignedPaymentDetail='+signed;
    cb(null, redirectUrl);
  });
};

var successful: function(data) {
  var transactionAuthCode = data.TransactionAuthCode;
  var result;
  var host = 'https://api.att.com/oauth/access_token?grant_type=client_credentials&client_id=4481acb392fb376ea58868eccae95872&client_secret=12ed0e43e1df5687&scope=PAYMENT';
  var headers = {'Accept': "*//*"};
  sendGet(host, headers, function(result) {
    var access_token = result.data.access_token;
    var expires_in = result.data.expires_in;
    var refresh_token = result.data.refresh_token;
    var host = 'https://api.att.com/Commerce/Payment/Rest/2/TRansactions/TransactionAuthCode/'+transactionAuthCode+'?access_token='+access_token;
    var headers = {'Accept': 'application/json'};
    sendGet(host, headers, function(result) {
      console.log(result);
    });
  });
});

function uuid() {
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

