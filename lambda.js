var AWS = require('aws-sdk');
var ses = new AWS.SES();
const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();
 
var RECEIVER = 'Koffer Robot <robot@koffer.io>';
var SENDER = 'Koffer Robot <robot@koffer.io>';

//*******************************
// Main handler
//*******************************
exports.handler = function (event, context) {

    sendConfirmation(event, function (err, data) {
        context.done(err, null)
    });
    
    sendEmail(event, function (err, data) {
        context.done(err, null)
    });
    
    addToDynamoDB(event, function (err, data) {
        context.done(err, null)
    });

}

//*******************************
// Helper functions
//*******************************
function sendEmail (event, done) {
    var params = {
        Destination: {
            ToAddresses: [
                event.email
            ], 
            BccAddresses: [
              RECEIVER
            ]
        },
        Message: {
            Body: {
                Text: {
                    Data: "Hi there, \n\nThank you for signing up. \n\nWe’ll let you know when we are open for business – but we hope it is going to be sooner rather than later!" +
                    "\n\nAll best, \nMichael",
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: 'Thank you from Koffer!',
                Charset: 'UTF-8'
            }
        },
        Source: SENDER
    }
    ses.sendEmail(params, done)
}

function sendConfirmation (event, done) {
    var params = {
        Destination: {
            ToAddresses: [
                RECEIVER
            ]
        },
        Message: {
            Body: {
                Text: {
                    Data: "New subscriber: " + event.email,
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: 'New Subscriber.',
                Charset: 'UTF-8'
            }
        },
        Source: SENDER
    }
    ses.sendEmail(params, done)
}

function addToDynamoDB (event, done) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    var time = new Date();
    time = time.toString();
    var params = {
    TableName: 'koffer_subscribers_DynamoDB',
        Item: {
          Email:  event.email, 
          Time_signed: time
        }
    };

    dynamo.putItem(params, done);   
}
