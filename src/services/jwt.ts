import jwt from 'jwt-simple';
import moment from 'moment';

import { UserEntity } from "../database/entity/user.entity";


const SECRET_KEY: string = process.env.SECRET_KEY!;

/**
 * Create a new access token for the user.
 * 
 * @param {UserEntity} user The user
 * 
 * @return {string} The json web token
 */
function createAccessToken(user: UserEntity) {
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
 * @param {UserEntity} user The user
 * 
 * @return {string} The json web token
 */
function createRefreshToken(user: UserEntity) {
  const payload: Object = {
    id: user.id,
    exp: moment().add(30, "days").unix()
  };

  return jwt.encode(payload, SECRET_KEY)
}

/**
 * Decode the token.
 * 
 * @param {string} token The user
 * 
 * @return {object} The json web token
 */
function decodeToken(token: string) {
  return jwt.decode(token, SECRET_KEY, true)
}

export = { createAccessToken, createRefreshToken, decodeToken }