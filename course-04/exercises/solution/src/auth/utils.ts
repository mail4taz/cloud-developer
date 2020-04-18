import { JwtToken } from './JwtToken'
import { decode } from 'jsonwebtoken'

export function getUserId(jwtToken): string {
    const decodedJwt = decode(jwtToken) as JwtToken
    return decodedJwt.sub
}