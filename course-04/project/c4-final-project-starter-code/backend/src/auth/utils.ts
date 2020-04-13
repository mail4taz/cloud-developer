import { decode } from 'jsonwebtoken'
import Axios from "axios"

import { Jwt } from './Jwt'
import { JwtPayload } from './JwtPayload'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

export function getUserFromToken(authHeader: string): string {
  const jwtToken = getToken(authHeader)

  const decodedToken = decode(jwtToken, { complete: true }) as Jwt

  return decodedToken.payload.sub
}

export async function getJwksCert(jwksUrl: string): Promise<any> {

  const response = await Axios.get(jwksUrl)

  if (response && response.data && Array.isArray(response.data.keys) && response.data.keys.length)
  {
    const cert = response.data.keys[0]
    if (cert && cert.x5c && cert.x5c.length)
      return cert.x5c[0]

    throw new Error(`Could not fetch jwks cert from ${jwksUrl}`) 
  }

  throw new Error(`Could not fetch jwks payload from ${jwksUrl}`)
}