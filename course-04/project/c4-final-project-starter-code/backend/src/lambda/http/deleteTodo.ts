import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserFromToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('DeleteTodoRequest')
const createError = require('http-errors')

//export const handler: APIGatewayProxyHandler
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    //logger.info('Processing event ', event);
    const todoId = event.pathParameters.todoId
    
    let userId: string
    try {
      userId = getUserFromToken(event.headers.Authorization)
    } catch (e) {
      logger.error('Missing auth token when fetching current user - ', e)

      throw new createError.Unauthorized('Missing auth token')
    }

    let delItem
    try {
      delItem = await deleteTodo(todoId, userId)
    } catch (e) {
      throw new createError.InternalServerError(`Failed to delete Todo ${todoId}`)
    }

    if (!delItem)
      throw new createError.NotFound(`Todo ${todoId} not found`)

    // TODO: Remove a TODO item by id
    return {
      statusCode: 200,
      body: ''
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    })
  )