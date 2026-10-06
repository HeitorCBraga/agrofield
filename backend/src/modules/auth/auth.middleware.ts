import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyAccessToken } from "../../lib/jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return reply.status(401).send({ message: "Token ausente" });
  }

  try {
    const payload = verifyAccessToken(token);
    request.userId = payload.sub;
  } catch {
    return reply.status(401).send({ message: "Token inválido ou expirado" });
  }
}
