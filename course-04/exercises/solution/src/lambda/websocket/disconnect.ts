'use strict'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()
const connectionTable = process.env.CONNECTIONS_TABLE


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const connectionId = event.requestContext.connectionId
  console.log('Websocket disconnect for : ', connectionId)
  
  const key = {
    id: connectionId
  }

  await docClient.delete({
    TableName: connectionTable,
    Key: key
  }).promise()

  return {
    statusCode: 200,
    body: ''
  }
}