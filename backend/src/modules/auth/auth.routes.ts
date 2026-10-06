import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { issueTokenPair, rotateRefreshToken, revokeRefreshToken } from "../../lib/jwt.js";

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: { name: string; email: string; password: string } }>("/auth/register", async (request, reply) => {
    const { name, email, password } = request.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ message: "E-mail já cadastrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: passwordHash },
    });

    const tokens = await issueTokenPair(user.id);

    return reply.status(201).send({
      user: { id: user.id, name: user.name, email: user.email },
      ...tokens,
    });
  });

  app.post<{ Body: { email: string; password: string } }>("/auth/login", async (request, reply) => {
    const { email, password } = request.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ message: "Credenciais inválidas" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return reply.status(401).send({ message: "Credenciais inválidas" });
    }

    const tokens = await issueTokenPair(user.id);

    return reply.send({
      user: { id: user.id, name: user.name, email: user.email },
      ...tokens,
    });
  });

  app.post<{ Body: { refreshToken: string } }>("/auth/refresh", async (request, reply) => {
    try {
      const tokens = await rotateRefreshToken(request.body.refreshToken);
      return reply.send(tokens);
    } catch {
      return reply.status(401).send({ message: "Refresh token inválido ou expirado" });
    }
  });

  app.post<{ Body: { refreshToken: string } }>("/auth/logout", async (request, reply) => {
    await revokeRefreshToken(request.body.refreshToken);
    return reply.status(204).send();
  });
}
