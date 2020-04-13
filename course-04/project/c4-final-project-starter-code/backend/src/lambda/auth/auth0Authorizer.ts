import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { getToken } from '../../auth/utils'
//import { getJwksCert } from '../../auth/utils'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-pryz2t86.eu.auth0.com/.well-known/jwks.json'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJKRcERytqMsZtMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1wcnl6MnQ4Ni5ldS5hdXRoMC5jb20wHhcNMjAwNDA5MTg0MTI3WhcN
MzMxMjE3MTg0MTI3WjAkMSIwIAYDVQQDExlkZXYtcHJ5ejJ0ODYuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvFT8fkZyZLSpz40n
R3cJN6lb2xxVKRD8bDstmSClnGSrMNvHPP9jKb9jyfKsT8ofymUIXNtnOUhXMBwQ
WRfkpqt3ao4PYBth7JSVxCx3gKkERcrTiglFnFJViSk7EbDmNw2tuww9TPTBOIg7
BNDsm9KrecuGIGl+Yt/pJsZBeuqyPRY+q1corZyeQd9AuGR9Kol3n4juWq6Zgpt3
BrZttU5slTSH5WO6a3fVDi73Vwbts6pr9FWgGsaChMHfiUVOCGMDbpDwbrvWCnoz
OxJ3G0xZS+I54zb/0Lkpijnmb7U5qeDFRIBK4IlgSU3+Z01ce/bJmmMMQlkcwZBo
iEUmuwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTdzVlB0Rpl
AweP8wcBST7yWwfxjzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AEvNNzv4mOR43OjZExrtZbsSMx08B7rhsEgZ22NRfU/oW5hZ5DexVpB/rG5tD/kd
CEi+EYuGfbjUM0gfH2QYb39wGzi0O1q32RYweBLvi83HDS6fqalavD7Lye20OQtT
YRF8adkWWxLFftKlQ1v+N/LFcsk6Cvfpp4LguoMCGn3KXQOiKp/Yv+O/web0ZiAr
Na8LW9TBoA7ltc3bMBKOaIOm2E+xORQYqRfVzdBE/z3zq4n2JudeCrreDX3spOOu
zGdYm73SPpWb+gOM+u7euX6/jmCM4VhBRbPUWxw1acusFrRhT49wSBS8rKePD5hl
eFsFQIIa+gRahync/0bvB54=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
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
    logger.error('User not authorized', e)

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

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  //const cert = await getJwksCert(jwksUrl)
  
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}
