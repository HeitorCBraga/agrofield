import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { redis } from "./redis.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface AccessTokenPayload {
  sub: string;
}

interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export async function issueTokenPair(userId: string) {
  const jti = randomUUID();

  const accessToken = jwt.sign({ sub: userId } satisfies AccessTokenPayload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ sub: userId, jti } satisfies RefreshTokenPayload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });

  await redis.set(`refresh:${jti}`, userId, "EX", REFRESH_TTL_SECONDS);

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export async function rotateRefreshToken(token: string) {
  const payload = jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;

  const storedUserId = await redis.get(`refresh:${payload.jti}`);
  if (!storedUserId || storedUserId !== payload.sub) {
    throw new Error("Refresh token inválido ou expirado");
  }

  await redis.del(`refresh:${payload.jti}`);

  return issueTokenPair(payload.sub);
}

export async function revokeRefreshToken(token: string) {
  const payload = jwt.decode(token) as RefreshTokenPayload | null;
  if (payload?.jti) {
    await redis.del(`refresh:${payload.jti}`);
  }
}
