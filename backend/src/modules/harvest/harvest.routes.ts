import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { getOwnedCrop, getOwnedHarvest } from "../../lib/ownership.js";
import { authenticate } from "../auth/auth.middleware.js";

interface HarvestBody {
  quantityKg: number;
  harvestedAt: string;
}

export async function harvestRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.post<{ Params: { cropId: string }; Body: HarvestBody }>(
    "/crops/:cropId/harvests",
    async (request, reply) => {
      const crop = await getOwnedCrop(request.params.cropId, request.userId!);
      if (!crop) {
        return reply.status(404).send({ message: "Cultura não encontrada" });
      }

      const { quantityKg, harvestedAt } = request.body;
      const harvest = await prisma.harvest.create({
        data: { quantityKg, harvestedAt: new Date(harvestedAt), cropId: crop.id },
      });

      return reply.status(201).send(harvest);
    },
  );

  app.get<{ Params: { cropId: string } }>("/crops/:cropId/harvests", async (request, reply) => {
    const crop = await getOwnedCrop(request.params.cropId, request.userId!);
    if (!crop) {
      return reply.status(404).send({ message: "Cultura não encontrada" });
    }

    return prisma.harvest.findMany({
      where: { cropId: crop.id },
      orderBy: { harvestedAt: "desc" },
    });
  });

  app.get<{ Params: { id: string } }>("/harvests/:id", async (request, reply) => {
    const harvest = await getOwnedHarvest(request.params.id, request.userId!);
    if (!harvest) {
      return reply.status(404).send({ message: "Colheita não encontrada" });
    }

    return harvest;
  });

  app.put<{ Params: { id: string }; Body: Partial<HarvestBody> }>("/harvests/:id", async (request, reply) => {
    const harvest = await getOwnedHarvest(request.params.id, request.userId!);
    if (!harvest) {
      return reply.status(404).send({ message: "Colheita não encontrada" });
    }

    const { harvestedAt, ...rest } = request.body;
    const updated = await prisma.harvest.update({
      where: { id: harvest.id },
      data: { ...rest, ...(harvestedAt ? { harvestedAt: new Date(harvestedAt) } : {}) },
    });

    return updated;
  });

  app.delete<{ Params: { id: string } }>("/harvests/:id", async (request, reply) => {
    const harvest = await getOwnedHarvest(request.params.id, request.userId!);
    if (!harvest) {
      return reply.status(404).send({ message: "Colheita não encontrada" });
    }

    await prisma.harvest.delete({ where: { id: harvest.id } });

    return reply.status(204).send();
  });
}
