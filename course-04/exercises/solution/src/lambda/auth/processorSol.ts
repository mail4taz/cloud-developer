import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

//const cert = process.env.AUTH0_CERT
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

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => { 
  try {
    const decodedToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', decodedToken)

    return {
      principalId: decodedToken.sub,
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

function verifyToken(authHeader: string) : JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  //if (token !== '123')
  //  throw new Error('Authentication failed')
  console.log(cert.substr(0,30))
  return verify(
    token,
    cert,
    { algorithms: ['RS256'] }
    ) as JwtToken
}