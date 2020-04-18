import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
//import * as AWS from 'aws-sdk'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

import * as middy from 'middy'
import { cors, secretsManager } from 'middy/middlewares'


const secretId = process.env.AUTH0_SECRET_ID
const secretField = process.env.AUTH0_SECRET_FIELD

//const secret = process.env.AUTH0_SECRET
//const client = new AWS.SecretsManager()
//let cachedSecret: string

//export const handler = async (event: CustomAuthorizerEvent, context): Promise<CustomAuthorizerResult> => {
export const handler = middy(
  async (event: CustomAuthorizerEvent, context): Promise<CustomAuthorizerResult> => {  
  try {
    const decodedToken = verifyToken(
      event.authorizationToken,
      context.secretContextObj[secretField]
    )
    /*
    const decodedToken = await verifyToken(
      event.authorizationToken
    )*/
    console.log('User was authorized', decodedToken)

    return {
      principalId: decodedToken.sub,
      //principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}
)

function verifyToken(authHeader: string, secret: string) : JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  //if (token !== '123')
  //  throw new Error('Authentication failed')
  
  return verify(token, secret) as JwtToken
}

/*
async function verifyToken(authHeader: string) : Promise<JwtToken> {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  const ssmContainer: any = await getSecretInSSM()
  const aSecret = ssmContainer[secretField]
  
  return verify(token, aSecret) as JwtToken
}

async function getSecretInSSM() {
    if (cachedSecret)
        return JSON.parse(cachedSecret)

    const data = await client.getSecretValue({
        SecretId: secretId
    })
    .promise()

    cachedSecret = data.SecretString
    //console.log('Successfully retried secret', cachedSecret);
    return JSON.parse(cachedSecret)
}*/

handler
  .use(
    secretsManager({
      cache: true,
      cacheExpiryInMillis: 60000,
      throwOnFailedCall: true,
      secrets: {
        secretContextObj: secretId
      }
    })  
  )