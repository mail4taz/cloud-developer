/*const data = [
    {
        "id": 1,
        "name": "Dogs",
        "description": "only dog images"
    },
    {
        "id": 2,
        "name": "Cats",
        "description": "only cat images"        
    },
    {
        "id": 3,
        "name": "Other",
        "description": "other images"        
    }
];*/

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE

exports.handler = async (event) => {
  console.log('Processing event: ', event)

  // TODO: Read and parse "limit" and "nextKey" parameters from query parameters
  let nextKey = getQueryParameter(event,"nextKey") // Next key to continue scan operation if necessary
  let limit = getQueryParameter(event,"limit") // Maximum number of elements to return

  // TODO: Return 400 error if parameters are invalid
  if (!limit)
  {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: "Please provide \"limit\" parameter to fetch results"
      }
  }

  // Scan operation parameters
  const scanParams = {
    TableName: groupsTable,
    // TODO: Set correct pagination parameters
    Limit: limit,
    ExclusiveStartKey: nextKey ? JSON.parse(decodeURIComponent(nextKey)) : null
  }
  console.log('Scan params: ', scanParams)

  const result = await docClient.scan(scanParams).promise()

  const items = result.Items

  console.log('Result: ', result)

  // Return result
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items,
      // Encode the JSON object so a client can return it in a URL as is
      nextKey: encodeNextKey(result.LastEvaluatedKey)
    })
  }
}

/**
 * Get a query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 * @param {string} name a name of a query parameter to return
 *
 * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
 */
function getQueryParameter(event, name) {
  const queryParams = event.queryStringParameters
  if (!queryParams) {
    return undefined
  }

  return queryParams[name]
}

/**
 * Encode last evaluated key using
 *
 * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
 *
 * @return {string} URI encoded last evaluated key
 */
function encodeNextKey(lastEvaluatedKey) {
  if (!lastEvaluatedKey) {
    return null
  }

  return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}
