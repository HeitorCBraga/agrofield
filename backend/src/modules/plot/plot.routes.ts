import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";

interface PlotBody {
  name: string;
  areaHa: number;
  soilType: string;
}

async function findOwnedProperty(propertyId: string, ownerId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  return property && property.ownerId === ownerId ? property : null;
}

async function findOwnedPlot(plotId: string, ownerId: string) {
  const plot = await prisma.plot.findUnique({ where: { id: plotId }, include: { property: true } });
  return plot && plot.property.ownerId === ownerId ? plot : null;
}

export async function plotRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.post<{ Params: { propertyId: string }; Body: PlotBody }>(
    "/properties/:propertyId/plots",
    async (request, reply) => {
      const property = await findOwnedProperty(request.params.propertyId, request.userId!);
      if (!property) {
        return reply.status(404).send({ message: "Propriedade não encontrada" });
      }

      const { name, areaHa, soilType } = request.body;
      const plot = await prisma.plot.create({
        data: { name, areaHa, soilType, propertyId: property.id },
      });

      return reply.status(201).send(plot);
    },
  );

  app.get<{ Params: { propertyId: string } }>("/properties/:propertyId/plots", async (request, reply) => {
    const property = await findOwnedProperty(request.params.propertyId, request.userId!);
    if (!property) {
      return reply.status(404).send({ message: "Propriedade não encontrada" });
    }

    return prisma.plot.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: "desc" },
    });
  });

  app.get<{ Params: { id: string } }>("/plots/:id", async (request, reply) => {
    const plot = await findOwnedPlot(request.params.id, request.userId!);
    if (!plot) {
      return reply.status(404).send({ message: "Talhão não encontrado" });
    }

    return plot;
  });

  app.put<{ Params: { id: string }; Body: Partial<PlotBody> }>("/plots/:id", async (request, reply) => {
    const plot = await findOwnedPlot(request.params.id, request.userId!);
    if (!plot) {
      return reply.status(404).send({ message: "Talhão não encontrado" });
    }

    const updated = await prisma.plot.update({
      where: { id: plot.id },
      data: request.body,
    });

    return updated;
  });

  app.delete<{ Params: { id: string } }>("/plots/:id", async (request, reply) => {
    const plot = await findOwnedPlot(request.params.id, request.userId!);
    if (!plot) {
      return reply.status(404).send({ message: "Talhão não encontrado" });
    }

    await prisma.plot.delete({ where: { id: plot.id } });

    return reply.status(204).send();
  });
}
