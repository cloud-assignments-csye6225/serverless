const awssdk = require("aws-sdk")
awssdk.config.update({region: 'us-east-1'})
const documentClient = new awssdk.DynamoDB.DocumentClient()
const ses = new awssdk.SES()