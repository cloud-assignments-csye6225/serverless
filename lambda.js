const awssdk = require("aws-sdk")
awssdk.config.update({region: 'us-east-1'})
const documentClient = new awssdk.DynamoDB.DocumentClient()
const ses = new awssdk.SES()

exports.emailVerification = (event, context, callback) => {

    console.log(event)

    let snsmessage = event.Records[0].Sns.Message
    console.log(Object.keys(event.Records[0].Sns))
    console.log(event.Records[0].Sns.MessageAttributes)
    console.log("Email ID for Verification is: "+event.Records[0].Sns.MessageAttributes.username.Value)
    let emailId = event.Records[0].Sns.MessageAttributes.username.Value
    let tokenValue = event.Records[0].Sns.MessageAttributes.token.Value

    let getEmailListParams = {
        TableName: 'SESDDBTable',
        Key: {
            emailid: emailId
        }
    }

    let putEmailParams = {
        TableName: "SESDDBTable",
        Item: {
            emailid: emailId
        }
    }

    documentClient.get(getEmailListParams, function(err, emaillist) {
        if (err) console.log(err)
        else {
            console.log("email list is: "+emaillist)
            console.log("Number of emails in Email list"+Object.keys(emaillist).length)
            // If email not found, add email to list
            if (Object.keys(emaillist).length === 0) {
                let emailInfoParams = {
                    Destination: {
                        ToAddresses: [emailId]
                    },
                    Message: {
                        Body: {
                            Text: {
                                Data: "Please click on this link to verify your email  http://prod.kartheekdabbiru.me/v1/verifyUserEmail?email="+emailId+"&token="+tokenValue
                            }
                        },
                        Subject: {
                            Data: "Email Verification Request"
                        }
                    },
                    Source: "noreply@prod.kartheekdabbiru.me"
                };

                console.log("reached to email")
                ses.sendEmail(emailInfoParams, function (err, data) {
                    if (err) {
                        console.log(err)
                        callback(null, {err: err})
                    }
                    else {
                        console.log("Email sent to user for verification!");
                        documentClient.put(putEmailParams, (err, data) => {
                            if (err) {
                                console.log("Error in adding item to Email list table")
                            }
                            else {
                                console.log(`Email id ${putEmailParams.Item.emailid} added to sent list`)
                            }
                        })
                        callback(null, {data: data})
                    }
                });
            } else {
                console.log("Email already sent")
            }
        }
    })
}