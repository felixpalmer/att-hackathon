'use strict';

function uuid() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

Meteor.methods({
  payment: function() {
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
                'MerchantProductId': 'http://localhost'
                };

    Meteor.http.post(url, {'headers': headers, 'data': data}, function(data) {
      console.log(data);
    });
  };
});
