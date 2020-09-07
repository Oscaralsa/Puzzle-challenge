import jwt from 'jwt-simple';
import moment from 'moment';

import { UserEntity } from "../database/entity/user.entity";

export interface Payload {
  id: number;
  email: string;
  name: string;
  createToken: number;
  exp: number;
}

const SECRET_KEY: string = process.env.SECRET_KEY!;

/**
 * Create a new access token for the user.
 * 
 * @param {UserEntity} user The user
 * 
 * @return {string} The json web token
 */
export function createAccessToken(user: UserEntity): string {
  const payload: Object = {
    id: user.id,
    name: user.name,
    email: user.email,
    createToken: moment().unix(),
    exp: moment().add(3, "hours").unix()
  };

  return jwt.encode(payload, SECRET_KEY)
}

/**
 * Create a new refresh token for the user.
 * 
 * @param {UserEntity} The user
 * 
 * @return {string} The json web token
 */
export function createRefreshToken(user: UserEntity): string {
  const payload: Object = {
    id: user.id,
    exp: moment().add(30, "days").unix()
  };

  return jwt.encode(payload, SECRET_KEY)
}

/**
 * Decode the token.
 * 
 * @param {string} token The json web token.
 * 
 * @return {Payload} The json web token decoded.
 */
export function decodeToken(token: string): Payload {
  return jwt.decode(token, SECRET_KEY, true)
}

