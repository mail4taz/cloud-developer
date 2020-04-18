'use strict'

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { createGroup } from "../../businessLogic/groups"
import { CreateGroupRequest } from "../../requests/CreateGroupRequest"
import { Group } from "../../models/Group"


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  //console.log('Processing event: ', event)
  
  const request: CreateGroupRequest = JSON.parse(event.body)
  const authHeader = event.headers.Authorization
  const split = authHeader.split(' ')
  const jwtToken = split[1]

  const newGroup: Group = await createGroup(request, jwtToken)

  return { 
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      newGroup
    })
  }
}
