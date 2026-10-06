import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { getOwnedPlot, getOwnedCrop } from "../../lib/ownership.js";
import { authenticate } from "../auth/auth.middleware.js";

interface CropBody {
  name: string;
  variety?: string;
  plantedAt: string;
  expectedHarvestAt?: string;
}

export async function cropRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.post<{ Params: { plotId: string }; Body: CropBody }>("/plots/:plotId/crops", async (request, reply) => {
    const plot = await getOwnedPlot(request.params.plotId, request.userId!);
    if (!plot) {
      return reply.status(404).send({ message: "Talhão não encontrado" });
    }

    const { name, variety, plantedAt, expectedHarvestAt } = request.body;
    const crop = await prisma.crop.create({
      data: {
        name,
        variety,
        plantedAt: new Date(plantedAt),
        expectedHarvestAt: expectedHarvestAt ? new Date(expectedHarvestAt) : null,
        plotId: plot.id,
      },
    });

    return reply.status(201).send(crop);
  });

  app.get<{ Params: { plotId: string } }>("/plots/:plotId/crops", async (request, reply) => {
    const plot = await getOwnedPlot(request.params.plotId, request.userId!);
    if (!plot) {
      return reply.status(404).send({ message: "Talhão não encontrado" });
    }

    return prisma.crop.findMany({
      where: { plotId: plot.id },
      orderBy: { plantedAt: "desc" },
    });
  });

  app.get<{ Params: { id: string } }>("/crops/:id", async (request, reply) => {
    const crop = await getOwnedCrop(request.params.id, request.userId!);
    if (!crop) {
      return reply.status(404).send({ message: "Cultura não encontrada" });
    }

    return crop;
  });

  app.put<{ Params: { id: string }; Body: Partial<CropBody> }>("/crops/:id", async (request, reply) => {
    const crop = await getOwnedCrop(request.params.id, request.userId!);
    if (!crop) {
      return reply.status(404).send({ message: "Cultura não encontrada" });
    }

    const { plantedAt, expectedHarvestAt, ...rest } = request.body;
    const updated = await prisma.crop.update({
      where: { id: crop.id },
      data: {
        ...rest,
        ...(plantedAt ? { plantedAt: new Date(plantedAt) } : {}),
        ...(expectedHarvestAt ? { expectedHarvestAt: new Date(expectedHarvestAt) } : {}),
      },
    });

    return updated;
  });

  app.delete<{ Params: { id: string } }>("/crops/:id", async (request, reply) => {
    const crop = await getOwnedCrop(request.params.id, request.userId!);
    if (!crop) {
      return reply.status(404).send({ message: "Cultura não encontrada" });
    }

    await prisma.crop.delete({ where: { id: crop.id } });

    return reply.status(204).send();
  });
}
