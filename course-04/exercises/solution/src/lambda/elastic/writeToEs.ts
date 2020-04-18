'use strict'

import { DynamoDBStreamHandler, DynamoDBStreamEvent } from 'aws-lambda';
import 'source-map-support/register';
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

const esHost = process.env.ELASTIC_ENDPOINT
const es = new elasticsearch.Client({
   hosts: [ esHost ],
   connectionClass: httpAwsEs
 })

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing event: ', event)

  for (const record of event.Records) {
      console.log('Processing dynamo record', JSON.stringify(record.dynamodb))

      if (record.eventName !== 'INSERT') {
          continue
      }

      const newItem = record.dynamodb.NewImage
      const imageId = newItem.imageId.S

      const body = {
          imageId: newItem.imageId.S,
          groupId: newItem.groupId.S,
          imageUrl: newItem.imageUrl.S,
          timestamp: newItem.timestamp.S,
          title: newItem.title.S
      }

      await es.index({
        index: 'images-index',
        type: 'images',
        id: imageId, // Document ID
        body
      })
  }
}