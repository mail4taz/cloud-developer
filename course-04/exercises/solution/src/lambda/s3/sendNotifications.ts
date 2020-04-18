import { S3Handler, S3Event, SNSHandler, SNSEvent } from 'aws-lambda'
import 'source-map-support/register'

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()
const connectionTable = process.env.CONNECTIONS_TABLE
const stage = process.env.STAGE
const apiId = process.env.API_ID

const connectionParams = {
    apiVersion: '2020-04-01',
    endpoint: `${apiId}.execute-api.us-east-2.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams);

export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event', JSON.stringify(event))

    if (event.Records)
    {    
        for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message
        console.log('Processing S3 event from SNS topic', s3EventStr)

        await processS3Event(JSON.parse(s3EventStr))
        }
    }
}

/*
export const handler: S3Handler = async (event: S3Event) => {
    await processS3Event(event)
}
*/

async function processS3Event(event: S3Event) {
    //console.log('Processing S3 event', JSON.stringify(event))

    const connections = await docClient.scan({
        TableName: connectionTable
    }).promise();

    for (const record of event.Records) {
        const key = record.s3.object.key;
        console.log('Processing event key ', key)

        let payload = {
            imageId: key
        }

        for (const connection of connections.Items) {
            await sendMessageToClient(connection.id, payload)
        }
    }
}

async function sendMessageToClient(connectionId, payload) {
    try {
        console.log('Sending payload to connection ', connectionId)

        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(payload)
        }).promise()
    } catch (e) {
        console.log('Exception raised: ', JSON.stringify(e))
        if (e.statusCode === 410) {
            console.log('Stale connection')

            await docClient.delete({
                TableName: connectionTable,
                Key: {id: connectionId}
            }).promise();
        }
    }
}