import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { getOwnedCrop, getOwnedInputApplication } from "../../lib/ownership.js";
import { authenticate } from "../auth/auth.middleware.js";

interface InputApplicationBody {
  productName: string;
  quantity: number;
  unit: string;
  appliedAt: string;
}

export async function inputApplicationRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.post<{ Params: { cropId: string }; Body: InputApplicationBody }>(
    "/crops/:cropId/input-applications",
    async (request, reply) => {
      const crop = await getOwnedCrop(request.params.cropId, request.userId!);
      if (!crop) {
        return reply.status(404).send({ message: "Cultura não encontrada" });
      }

      const { productName, quantity, unit, appliedAt } = request.body;
      const inputApplication = await prisma.inputApplication.create({
        data: { productName, quantity, unit, appliedAt: new Date(appliedAt), cropId: crop.id },
      });

      return reply.status(201).send(inputApplication);
    },
  );

  app.get<{ Params: { cropId: string } }>("/crops/:cropId/input-applications", async (request, reply) => {
    const crop = await getOwnedCrop(request.params.cropId, request.userId!);
    if (!crop) {
      return reply.status(404).send({ message: "Cultura não encontrada" });
    }

    return prisma.inputApplication.findMany({
      where: { cropId: crop.id },
      orderBy: { appliedAt: "desc" },
    });
  });

  app.get<{ Params: { id: string } }>("/input-applications/:id", async (request, reply) => {
    const inputApplication = await getOwnedInputApplication(request.params.id, request.userId!);
    if (!inputApplication) {
      return reply.status(404).send({ message: "Aplicação de insumo não encontrada" });
    }

    return inputApplication;
  });

  app.put<{ Params: { id: string }; Body: Partial<InputApplicationBody> }>(
    "/input-applications/:id",
    async (request, reply) => {
      const inputApplication = await getOwnedInputApplication(request.params.id, request.userId!);
      if (!inputApplication) {
        return reply.status(404).send({ message: "Aplicação de insumo não encontrada" });
      }

      const { appliedAt, ...rest } = request.body;
      const updated = await prisma.inputApplication.update({
        where: { id: inputApplication.id },
        data: { ...rest, ...(appliedAt ? { appliedAt: new Date(appliedAt) } : {}) },
      });

      return updated;
    },
  );

  app.delete<{ Params: { id: string } }>("/input-applications/:id", async (request, reply) => {
    const inputApplication = await getOwnedInputApplication(request.params.id, request.userId!);
    if (!inputApplication) {
      return reply.status(404).send({ message: "Aplicação de insumo não encontrada" });
    }

    await prisma.inputApplication.delete({ where: { id: inputApplication.id } });

    return reply.status(204).send();
  });
}
