'use strict'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const AWS = require('aws-sdk')
const uuid = require('uuid')

const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE
const imagesBucket = process.env.IMAGES_BUCKET
const signedUrlExpireSeconds = 300 //process.env.SIGNED_URL_EXPIRATION
//const awsRegion = process.env.AWS_REGION
const s3 = new AWS.S3({
    signatureVersion: 'v4',
    params: {Bucket: imagesBucket}
});

//export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  //console.log('Processing event: ', event)

  const groupId = event.pathParameters.groupId
  const validGroupId = await groupIdExists(groupId)
  if (!validGroupId) {
    // Return result
    return {
      statusCode: 404,
      /*headers: {
        'Access-Control-Allow-Origin': '*'
      },*/
      body: JSON.stringify({
        error: 'Group does not exist'
      })
    }
  }

  const itemId = uuid.v4()
  const url = getUploadUrl(itemId)
  const imageProps = JSON.parse(event.body)
  const newItem = {
    imageId: itemId,
    groupId: groupId,
    timestamp: new Date().toISOString(),
    ...imageProps,
    imageUrl: `https://${imagesBucket}.s3.amazonaws.com/${itemId}`
  }

  //console.log('Adding image: ', newItem)
  await docClient.put({
    TableName: imagesTable,
    Item: newItem
  }).promise()

  return {
    statusCode: 201,
    /*headers: {
      'Access-Control-Allow-Origin': '*'
    },*/
    body: JSON.stringify({
      newItem: newItem,
      uploadUrl: url
    })
  }
})

async function groupIdExists(groupId: string) {
  const result = await docClient.get({
     TableName: groupsTable,
     Key: {
       id: groupId
     }
  }).promise()

  console.log('Get valid group:', result)
  return !!result.Item
}

/* getPutSignedUrl generates an aws signed url to put an item
* @Params
*    key: string - the filename to be retreived from s3 bucket
* @Returns:
*    a url as a string
*/
function getUploadUrl( imageId: string  ){
  const url = s3.getSignedUrl('putObject', {
      Bucket: imagesBucket,
      Key: imageId,
      Expires: signedUrlExpireSeconds
  });

  return url;
}

handler
  .use(
    cors({
      credentials: true,
    })
  )