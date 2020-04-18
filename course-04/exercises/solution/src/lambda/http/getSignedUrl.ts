'use strict'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';

const AWS = require('aws-sdk')
const imagesBucket = process.env.IMAGES_BUCKET
const signedUrlExpireSeconds = process.env.SIGNED_URL_EXPIRATION
//const awsRegion = process.env.AWS_REGION
const s3 = new AWS.S3({
    signatureVersion: 'v4',
    params: {Bucket: imagesBucket}
});

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const fileName = event.pathParameters.fileName
    return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          url: getPutSignedUrl(fileName)
        })
      }
}  
  
/* getGetSignedUrl generates an aws signed url to retreive an item
* @Params
*    key: string - the filename to be put into the s3 bucket
* @Returns:
*    a url as a string
*/
function getGetSignedUrl( key: string ): string {
    const url = s3.getSignedUrl('getObject', {
        Bucket: imagesBucket,
        Key: key,
        Expires: signedUrlExpireSeconds
    });

    return url;
}
  
/* getPutSignedUrl generates an aws signed url to put an item
* @Params
*    key: string - the filename to be retreived from s3 bucket
* @Returns:
*    a url as a string
*/
function getPutSignedUrl( key: string  ){
    const url = s3.getSignedUrl('putObject', {
        Bucket: imagesBucket,
        Key: key,
        Expires: signedUrlExpireSeconds
    });

    return url;
}