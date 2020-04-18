import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()

const imagesTable = process.env.IMAGES_TABLE
const imagesIdIdx = process.env.IMAGE_ID_IDX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const imageId = event.pathParameters.imageId

  const result = await docClient.query({
    TableName: imagesTable,
    IndexName: imagesIdIdx,
    KeyConditionExpression: 'imageId = :imageId',
    ExpressionAttributeValues: {
      ':imageId': imageId
    },
    ScanIndexForward: false
  }).promise()

  const items = result.Items
  //console.log('Result: ', items)

  if (result.Count > 0) {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(
        result.Items[0]
      )
    }
  }
  else {
    // Return result
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Could not find image'
      })
    }
  }
  
}
