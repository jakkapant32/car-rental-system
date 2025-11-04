import jwt = require('jsonwebtoken');
import { env } from '../config/env';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export function generateToken(payload: JWTPayload): string {
  // @ts-expect-error - expiresIn accepts string values like "24h" but types are strict
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function generateRefreshToken(payload: JWTPayload): string {
  // @ts-expect-error - expiresIn accepts string values like "7d" but types are strict
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
}

