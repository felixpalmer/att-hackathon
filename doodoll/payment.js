'use strict';

function uuid() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

Meteor.methods({
  payment: function() {
    var result;
    var url = 'https://api.att.com/Security/Notary/Rest/1/SignedPayload';
    var headers = {'Content-type': 'application/json',
                   'Accept': 'application/json',
                   'Client_id': '4481acb392fb376ea58868eccae95872',
                   'Client_secret': '12ed0e43e1df5687'};
    var data = {'Amount': 0.99,
                'Category': 3,
                'Channel': 'MOBILE_WEB',
                'Description': 'TEST',
                'MerchantTransactionId': uuid,
                'MerchantProductId': 'http://localhost/authorized'
                };

    Meteor.http.post(url, {'headers': headers, 'data': data}, function(result) {
      console.log(result);
      var signed = result.data.signeddocument;
      var signature = result.data.signature;
      //redirect client to this url
      var redirectUrl = 'http://api/att.com/Commerce/Payment/Rest/2/Transactions?Signature='+signature+'&SignedPaymentDetail='+signed;
    });
  };

  successful: function(data) {
    var transactionAuthCode = data.TransactionAuthCode;
    var result;
    var url = 'https://api.att.com/oauth/access_token?grant_type=client_credentials&client_id=4481acb392fb376ea58868eccae95872&client_secret=12ed0e43e1df5687&scope=PAYMENT';
    var headers = {'Accept': '*/*'};
    Meteor.http.get(url, {'headers': headers}, function(result) {
      console.log(result);
      var access_token = result.data.access_token;
      var expires_in = result.data.expires_in;
      var refresh_token = result.data.refresh_token;
      var url = 'https://api.att.com/Commerce/Payment/Rest/2/TRansactions/TransactionAuthCode/'+transactionAuthCode+'?access_token='+access_token;
      var headers = {'Accept': 'application/json'};
      Meteor.http.get(url, {'headers': headers}, function(result) {
        console.log(result);
      });
    });
});
