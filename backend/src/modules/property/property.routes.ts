import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";

interface PropertyBody {
  name: string;
  city: string;
  state: string;
  areaHa: number;
}

export async function propertyRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.post<{ Body: PropertyBody }>("/properties", async (request, reply) => {
    const { name, city, state, areaHa } = request.body;

    const property = await prisma.property.create({
      data: { name, city, state, areaHa, ownerId: request.userId! },
    });

    return reply.status(201).send(property);
  });

  app.get("/properties", async (request) => {
    return prisma.property.findMany({
      where: { ownerId: request.userId! },
      orderBy: { createdAt: "desc" },
    });
  });

  app.get<{ Params: { id: string } }>("/properties/:id", async (request, reply) => {
    const property = await prisma.property.findUnique({ where: { id: request.params.id } });

    if (!property || property.ownerId !== request.userId) {
      return reply.status(404).send({ message: "Propriedade não encontrada" });
    }

    return property;
  });

  app.put<{ Params: { id: string }; Body: Partial<PropertyBody> }>("/properties/:id", async (request, reply) => {
    const existing = await prisma.property.findUnique({ where: { id: request.params.id } });

    if (!existing || existing.ownerId !== request.userId) {
      return reply.status(404).send({ message: "Propriedade não encontrada" });
    }

    const property = await prisma.property.update({
      where: { id: request.params.id },
      data: request.body,
    });

    return property;
  });

  app.delete<{ Params: { id: string } }>("/properties/:id", async (request, reply) => {
    const existing = await prisma.property.findUnique({ where: { id: request.params.id } });

    if (!existing || existing.ownerId !== request.userId) {
      return reply.status(404).send({ message: "Propriedade não encontrada" });
    }

    await prisma.property.delete({ where: { id: request.params.id } });

    return reply.status(204).send();
  });
}
