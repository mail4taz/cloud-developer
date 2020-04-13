import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { getUserFromToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('UpdateTodoRequest')
const createError = require('http-errors')

//export const handler: APIGatewayProxyHandler = 
export const handler = middy( 
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event ', event);
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    let userId: string
    try {
      userId = getUserFromToken(event.headers.Authorization)
    } catch (e) {
      logger.error('Missing auth token when fetching current user - ', e)

      throw new createError.Unauthorized('Missing auth token')
    }

    let updateItem
    try {
      updateItem = await updateTodo(todoId, userId, updatedTodo)
    } catch (e) {
      throw new createError.InternalServerError(`Failed to update Todo ${todoId}`)
    }

    if (!updateItem)
      throw new createError.NotFound(`Todo ${todoId} not found`)
     
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
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